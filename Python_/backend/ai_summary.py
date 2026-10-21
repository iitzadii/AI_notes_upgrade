from google import genai
import os


# Gemini client
client = genai.Client(
    api_key="AIzaSyAdgThaoRM8wCRatwV9LF889oOBHHyNzsw"
)


def generate_summary(notes):
    """
    Generate an AI summary from a list of notes.

    notes should look like:

    [
        {
            "title": "CNN",
            "content": "Convolutional Neural Networks..."
        },
        {
            "title": "MobileNetV2",
            "content": "MobileNetV2 is..."
        }
    ]
    """

    if not notes:
        return "There are no notes available to summarize."

    # Combine all notes into one piece of text
    notes_text = "\n\n".join(
        f"""
TITLE: {note["title"] or "Untitled"}

CONTENT:
{note["content"] or ""}
"""
        for note in notes
    )

    prompt = f"""
You are an AI note summarization assistant.

Summarize the following notes into a SHORT, CONCISE summary.

IMPORTANT RULES:

- Do not use Markdown.
- Keep the summary between 100 and 200 words.
- Focus only on the most important concepts and information.
- Remove repetition and unnecessary details.
- Do not explain every individual note separately.
- Combine related ideas together.
- Use short headings and bullet points where useful.
- Keep important technical terms and definitions.
- Use simple language that a student can understand.
- Do not invent information.
- Do not include information that is not present in the notes.
- Do not mention that you are an AI.

NOTES:

{notes_text}

Return ONLY the final summary.
"""

    try:

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt
        )

        return response.text

    except Exception as e:

        print("Gemini API error:", e)

        raise Exception("Failed to generate AI summary.")