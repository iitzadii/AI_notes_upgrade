import { useState } from "react";
import AddNote from "../components/AddNote";
import NotesGrid from "../components/NotesGrid";
import NoteModal from "../components/NoteModal";
import { api } from "../api/api";

function NotesPage({
  notes,
  selectedCategory,
  searchTerm,
  onAddNote,
  onUpdateNote,
  onDeleteNote
}) {
  const [selectedNote, setSelectedNote] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [mockSummary, setMockSummary] = useState("");

  const handleAISummary = async () => {
    setShowSummaryModal(true);
    setIsGeneratingSummary(true);
    setMockSummary("");
    try {
      const categoryPayload = {
        category:
          selectedCategory === "All Notes"
            ? null
            : selectedCategory
      };
      const response = await api.post(
        "/note/ai/summary",
        categoryPayload
      );
      setMockSummary(response.summary);
    } catch (error) {
      console.error("AI Summary Error:", error);
      setMockSummary(
        "Unable to generate the AI summary. Please try again."
      );
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Filter logic: Category + Search
  const filteredNotes = notes.filter(note => {
    // 1. Category Filter
    const noteCat = note.category || "General";
    const categoryMatch = selectedCategory === "All Notes" || noteCat === selectedCategory;

    // 2. Search Filter
    const searchLower = (searchTerm || "").toLowerCase();
    const titleMatch = (note.title || "").toLowerCase().includes(searchLower);
    const contentMatch = (note.content || "").toLowerCase().includes(searchLower);

    return categoryMatch && (titleMatch || contentMatch);
  });

  return (
    <div className="notes-page">
      <header className="page-header">
        <h1>{selectedCategory}</h1>
        <div className="header-actions">
          <button className="ai-summary-btn" onClick={handleAISummary}>
            <span className="sparkle-icon">✨</span> AI Summary
          </button>
        </div>
      </header>

      <div className="page-content">
        <AddNote onAdd={onAddNote} />

        {filteredNotes.length > 0 ? (
          <NotesGrid
            notes={filteredNotes}
            onNoteClick={setSelectedNote}
          />
        ) : (
          <div className="empty-state">
            <p>No notes found in "{selectedCategory}"</p>
          </div>
        )}
      </div>

      {selectedNote && (
        <NoteModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onUpdate={(updated) => {
            onUpdateNote(updated);
            setSelectedNote(null);
          }}
          onDelete={(note) => {
            onDeleteNote(note);
            setSelectedNote(null);
          }}
        />
      )}

      {showSummaryModal && (
        <div className="modal-overlay" onClick={() => setShowSummaryModal(false)}>
          <div className="modal-content ai-summary-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowSummaryModal(false)}>×</button>
            <h2>AI Summary</h2>
            <div className="summary-content-area">
              {isGeneratingSummary ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Generating AI Summary...</p>
                </div>
              ) : (
                <div className="summary-text">
                  <p>{mockSummary}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesPage;
