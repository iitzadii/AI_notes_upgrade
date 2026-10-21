import NoteCard from './NoteCard';

function NotesGrid({ notes, onNoteClick }) {
  if (notes.length === 0) {
    return (
      <div className="empty-message">
        No notes yet... start typing!
      </div>
    );
  }

  return (
    <div className="notes-grid">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onClick={() => onNoteClick(note)}
        />
      ))}
    </div>
  );
}

export default NotesGrid;
