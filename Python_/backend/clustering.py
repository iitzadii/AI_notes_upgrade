def recluster_notes(notes):

    # No notes
    if not notes:
        return {}

    # Only one note → General
    if len(notes) < 2:
        return {
            notes[0]["id"]: "General"
        }

    # 1. Build texts
    texts = [
        (note["title"] or "") + " " + (note["content"] or "")
        for note in notes
    ]

    # 2. TF-IDF
    from sklearn.feature_extraction.text import TfidfVectorizer

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2)
    )

    try:
        X = vectorizer.fit_transform(texts)
    except ValueError:
        return {
            note["id"]: "General"
            for note in notes
        }

    # 3. DBSCAN
    from sklearn.cluster import DBSCAN

    dbscan = DBSCAN(
        eps=0.85,
        min_samples=2,
        metric="cosine"
    )

    labels = dbscan.fit_predict(X)

    # 4. Generate cluster names
    cluster_names = {}

    import numpy as np

    feature_names = vectorizer.get_feature_names_out()

    unique_labels = set(labels)

    for label in unique_labels:

        if label == -1:
            continue

        indices = np.where(labels == label)[0]

        cluster_center = X[indices].mean(axis=0).A1

        top_indices = cluster_center.argsort()[::-1][:2]

        top_terms = [
            feature_names[i]
            for i in top_indices
        ]

        name = " ".join(
            t.capitalize()
            for t in top_terms
        )

        cluster_names[label] = name

    # 5. Return mapping
    cluster_map = {}

    for i in range(len(notes)):

        note_id = notes[i]["id"]
        cluster_id = int(labels[i])

        if cluster_id == -1:
            cluster_map[note_id] = "General"
        else:
            cluster_map[note_id] = cluster_names.get(
                cluster_id,
                "Cluster"
            )

    return cluster_map