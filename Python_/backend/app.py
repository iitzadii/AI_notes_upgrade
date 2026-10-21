from flask import Flask, jsonify, request
from flask_cors import CORS
from db import init_db, get_db
from clustering import recluster_notes
from ai_summary import generate_summary

app = Flask(__name__)
CORS(app)

init_db()


def get_user_id():
    """
    Get the authenticated user's ID sent by Spring Boot.
    React never sends this directly.
    """
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return None
    return user_id


@app.route("/")
def home():
    return jsonify({"status": "Backend is running"})


# GET notes for the logged-in user
@app.route("/notes", methods=["GET"])
def get_notes():

    user_id = get_user_id()

    if not user_id:
        return jsonify({"error": "User ID missing"}), 401

    db = get_db()

    notes = db.execute(
        """
        SELECT id, user_id, title, content, category, time, color
        FROM notes
        WHERE user_id = ?
        ORDER BY id DESC
        """,
        (user_id,)
    ).fetchall()

    db.close()

    result = [dict(note) for note in notes]

    return jsonify(result)


# ADD a new note
@app.route("/notes", methods=["POST"])
def add_note():

    user_id = get_user_id()

    if not user_id:
        return jsonify({"error": "User ID missing"}), 401

    data = request.json

    db = get_db()

    cursor = db.execute(
        """
        INSERT INTO notes
        (user_id, title, content, category, time, color)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            data["title"],
            data["content"],
            data["category"],
            data["time"],
            data.get("color", "note-yellow"),
        )
    )

    db.commit()

    new_note_id = cursor.lastrowid

    db.close()

    run_clustering_and_update_db(user_id)

    db = get_db()

    new_note = db.execute(
        """
        SELECT id, user_id, title, content, category, time, color
        FROM notes
        WHERE id = ?
        AND user_id = ?
        """,
        (new_note_id, user_id)
    ).fetchone()

    db.close()

    if new_note is None:
        return jsonify({
            "error": "Note was inserted but could not be retrieved"
        }), 500

    return jsonify(dict(new_note))


# DELETE a note belonging to the logged-in user
@app.route("/notes/<int:id>", methods=["DELETE"])
def delete_note(id):

    user_id = get_user_id()

    if not user_id:
        return jsonify({"error": "User ID missing"}), 401

    db = get_db()

    cursor = db.execute(
        """
        DELETE FROM notes
        WHERE id = ?
        AND user_id = ?
        """,
        (id, user_id)
    )

    db.commit()
    db.close()

    if cursor.rowcount == 0:
        return jsonify({
            "error": "Note not found"
        }), 404

    # Recluster only this user's remaining notes
    run_clustering_and_update_db(user_id)

    return jsonify({"success": True})


# UPDATE a note belonging to the logged-in user
@app.route("/notes/<int:id>", methods=["PUT"])
def update_note(id):

    user_id = get_user_id()

    if not user_id:
        return jsonify({"error": "User ID missing"}), 401

    data = request.json

    db = get_db()

    cursor = db.execute(
        """
        UPDATE notes
        SET title = ?,
            content = ?,
            category = ?,
            time = ?,
            color = ?
        WHERE id = ?
        AND user_id = ?
        """,
        (
            data["title"],
            data["content"],
            data["category"],
            data["time"],
            data.get("color", "note-yellow"),
            id,
            user_id
        )
    )

    db.commit()
    db.close()

    if cursor.rowcount == 0:
        return jsonify({
            "error": "Note not found"
        }), 404

    # Recluster only this user's notes
    run_clustering_and_update_db(user_id)

    # Fetch updated note
    db = get_db()

    updated_note = db.execute(
        """
        SELECT id, user_id, title, content, category, time, color
        FROM notes
        WHERE id = ?
        AND user_id = ?
        """,
        (id, user_id)
    ).fetchone()

    db.close()

    if updated_note is None:
        return jsonify({
            "error": "Updated note could not be retrieved"
        }), 500

    return jsonify(dict(updated_note))


def run_clustering_and_update_db(user_id):

    db = get_db()

    # IMPORTANT:
    # Only fetch notes belonging to this user.
    rows = db.execute(
        """
        SELECT id, title, content
        FROM notes
        WHERE user_id = ?
        """,
        (user_id,)
    ).fetchall()

    notes = [dict(row) for row in rows]

    cluster_map = recluster_notes(notes)

    for note_id, category_name in cluster_map.items():

        db.execute(
            """
            UPDATE notes
            SET category = ?
            WHERE id = ?
            AND user_id = ?
            """,
            (category_name, note_id, user_id)
        )

    db.commit()
    db.close()


@app.route("/ai/summary", methods=["POST"])
def ai_summary():

    user_id = get_user_id()

    if not user_id:
        return jsonify({"error": "User ID missing"}), 401

    data = request.json
    category = data.get("category")

    db = get_db()

    if category:
        notes = db.execute(
            """
            SELECT title, content
            FROM notes
            WHERE user_id = ?
            AND category = ?
            """,
            (user_id, category)
        ).fetchall()
    else:
        notes = db.execute(
            """
            SELECT title, content
            FROM notes
            WHERE user_id = ?
            """,
            (user_id,)
        ).fetchall()

    db.close()

    if not notes:
        return jsonify({
            "summary": "There are no notes available to summarize."
        })

    # AI step comes here
    try:
        summary = generate_summary(notes)
        return jsonify({
            "summary": summary
        })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)