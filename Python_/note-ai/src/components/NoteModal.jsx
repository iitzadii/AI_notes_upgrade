// src/components/NoteModal.jsx

import './NoteModal.css';
import { useState, useEffect } from 'react';

function NoteModal({ note, onClose, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);

  const handleSave = () => {
    onUpdate({ ...note, title, content });
    setIsEditing(false);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className={`modal-container ${note.color || ''}`}>
        {/* Top Right Close Button */}
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Note Display or Edit Fields */}
        <div className="modal-body">
          {isEditing ? (
            <div className="edit-fields">
              <input
                className="edit-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
              <textarea
                className="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note..."
              />
            </div>
          ) : (
            <div className="note-display">
              <span className="note-date">
                {new Date(note.time).toLocaleString()}
              </span>
              <h2 className="note-title">{title}</h2>
              <div className="note-content-scroll">
                <p className="note-content">{content}</p>
              </div>
            </div>
          )}
        </div>

        {/* Buttons bottom-right */}
        <div className="modal-buttons">
          {!isEditing && (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              Edit
            </button>
          )}
          <button className="delete-btn" onClick={() => onDelete(note)}>
            Delete
          </button>
          {isEditing && (
            <button className="save-btn" onClick={handleSave}>
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NoteModal;
