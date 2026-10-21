import { useState } from "react";

const COLORS = [
  "note-yellow",
  "note-orange",
  "note-pink",
  "note-blue",
  "note-green",
  "note-purple",
  "note-teal",
];

function AddNote({ onAdd }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const generateTitleFromContent = (text) => {
    if (!text) return "Untitled Note";
    return text
      .trim()
      .split(/\s+/)
      .slice(0, 5)
      .join(" ")
      .replace(/^./, (c) => c.toUpperCase());
  };

  function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;

    const finalTitle = title.trim()
      ? title
      : generateTitleFromContent(content);

    const newNote = {
      title: finalTitle,
      content,
      category: "General",
      time: new Date().toISOString(),
      color: selectedColor,
    };

    onAdd(newNote);
    setTitle("");
    setContent("");
    setSelectedColor(COLORS[0]);
  }

  return (
    <form className="add-note-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="color-picker-row">
        {COLORS.map((color) => (
          <div
            key={color}
            className={`color-circle ${color} ${selectedColor === color ? "selected" : ""}`}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>

      <textarea
        placeholder="Write your note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button type="submit">Add Note</button>
    </form>
  );
}

export default AddNote;
