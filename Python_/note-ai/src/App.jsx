import './App.css';
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from './components/Sidebar';
import NotesPage from "./pages/NotesPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { api } from "./api/api";
import { useAuth } from "./api/AuthContext";

function NotFoundRedirect() {
    const { isAuthenticated } = useAuth();

    return (
        <Navigate
            to={isAuthenticated ? "/notes" : "/login"}
            replace
        />
    );
}

function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Notes");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch initial notes
  useEffect(() => {
    api.get("/note/get")
      .then(data => setNotes(data))
      .catch(err => console.error("Failed to fetch notes", err));
  }, []);

  const handleAddNote = (newNote) => {
    api.post("/note/send", newNote)
      .then((savedNote) => {
        setNotes((prevNotes) => [savedNote, ...prevNotes]);
      })
      .catch((err) => {
        console.error("Failed to add note:", err);
      });
  };

  const handleUpdateNote = (updatedNote) => {
    api.put(`/note/${updatedNote.id}`, updatedNote)
      .then((updatedNoteFromServer) => {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === updatedNoteFromServer.id
              ? updatedNoteFromServer
              : n
          )
        );
      })
      .catch((err) => {
        console.error("Failed to update note", err);
      });
  };

  const handleDeleteNote = (noteToDelete) => {
    api.delete(`/note/${noteToDelete.id}`)
      .then(() => {
        setNotes((prev) =>
          prev.filter((n) => n.id !== noteToDelete.id)
        );
      })
      .catch((err) => {
        console.error("Failed to delete note", err);
      });
  };

  return (
    <div className="app-container">

      <Sidebar
        notes={notes}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddNote={handleAddNote}
      />

      <main className={`main-content ${isSidebarOpen ? 'shifted' : 'full'}`}>
        <NotesPage
          notes={notes}
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
          onAddNote={handleAddNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
        />
      </main>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Signup */}
        <Route path="/signup" element={<Signup />} />

        {/* Protected Notes Application */}
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <NotesApp />
            </ProtectedRoute>
          }
        />

        {/* Default route */}
        <Route path="*" element={<NotFoundRedirect />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;