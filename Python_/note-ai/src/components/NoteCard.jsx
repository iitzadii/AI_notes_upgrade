function NoteCard({ note, onClick }) {
  return (
    <div
      className={`note-card ${note.color}`}
      onClick={onClick}
    >
      <h3>{note.title}</h3>
      <p>{note.content}</p>
      {note.category && (
        <div className="category-tag">{note.category}</div>
      )}
    </div>
  );
}

export default NoteCard;
