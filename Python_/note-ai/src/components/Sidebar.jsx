import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Simple inline SVG icons for a premium feel without external deps
const Icons = {
  AllNotes: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14-7a2 2 0 012 2v6a2 2 0 01-2 2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2m4 0V4a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
    </svg>
  ),
  Folder: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),
  Logo: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Upload: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  )
};

function Sidebar({ notes, onSelectCategory, selectedCategory, isOpen, toggleSidebar, searchTerm, setSearchTerm, onAddNote }) {
  const categories = Array.from(new Set(notes.map(note => note.category || 'General')));
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    let content = "";
    const fileName = file.name;
    const extension = fileName.split('.').pop().toLowerCase();
    const title = fileName.replace(/\.[^/.]+$/, ""); // Remove extension

    try {
      if (extension === "txt") {
        content = await file.text();
      } else if (extension === "pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let pdfText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(" ");
          pdfText += pageText + "\n";
        }
        content = pdfText.trim();
        if (!content) {
          throw new Error("No extractable text found in PDF.");
        }
      } else if (extension === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        content = result.value.trim();
        if (!content) {
          throw new Error("No extractable text found in DOCX.");
        }
      } else {
        throw new Error("Unsupported file type.");
      }

      onAddNote({
        title: title,
        content: content,
        category: "Documents",
        color: "note-purple"
      });
      return { success: true };
    } catch (error) {
      console.error(`Error processing ${fileName}:`, error);
      return { success: false, fileName, error: error.message };
    }
  };

  const handleFiles = async (files) => {
    if (files.length === 0) return;
    if (files.length > 20) {
      setUploadStatus("Error: You can upload up to 20 files at a time.");
      return;
    }

    const validExtensions = ["txt", "pdf", "docx"];
    const validFiles = Array.from(files).filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return validExtensions.includes(ext);
    });

    if (validFiles.length !== files.length) {
      setUploadStatus("Some files ignored. Only .txt, .pdf, and .docx are supported.");
    }

    if (validFiles.length === 0) return;

    setIsProcessing(true);
    setUploadStatus(`Processing ${validFiles.length} file(s)...`);

    let successCount = 0;
    let failCount = 0;

    for (const file of validFiles) {
      const result = await processFile(file);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setIsProcessing(false);
    if (failCount > 0) {
      setUploadStatus(`Processed ${successCount}. Failed: ${failCount}.`);
    } else {
      setUploadStatus(`Successfully extracted ${successCount} document(s).`);
    }

    setTimeout(() => {
      setUploadStatus("");
    }, 4000);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onFileInput = (e) => {
    handleFiles(e.target.files);
    e.target.value = null; // Reset input
  };

  return (
    <aside className={`sidebar ${isOpen ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="brand-container">
          <span className="brand-icon"><Icons.Logo /></span>
          <h2 className="app-brand">Note AI</h2>
        </div>
        <button className="toggle-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          {isOpen ? <Icons.ChevronLeft /> : <Icons.ChevronRight />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <div
          className={`nav-item ${selectedCategory === 'All Notes' ? 'active' : ''}`}
          onClick={() => onSelectCategory('All Notes')}
        >
          <span className="icon"><Icons.AllNotes /></span>
          <span className="label">All Notes</span>
        </div>

        {isOpen && (
          <div className="sidebar-section">
            <div 
              className={`drag-drop-area ${isDragging ? 'dragging' : ''}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                onChange={onFileInput} 
                style={{ display: 'none' }} 
                accept=".txt,.pdf,.docx"
              />
              <Icons.Upload />
              <p>Drag & Drop files</p>
              <span>or click to upload (.txt, .pdf, .docx)</span>
            </div>
            {uploadStatus && (
              <div className="upload-status">
                {isProcessing && <div className="spinner-small"></div>}
                <span>{uploadStatus}</span>
              </div>
            )}
          </div>
        )}

        {isOpen && (
          <div className="sidebar-section">
            <div className="sidebar-search">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="categories-section">
          <h3>Categories</h3>
          <ul>
            {categories.map((cat) => (
              <li
                key={cat}
                className={selectedCategory === cat ? 'active' : ''}
                onClick={() => onSelectCategory(cat)}
              >
                <span className="icon"><Icons.Folder /></span>
                <span className="label">{cat}</span>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
