import React, { useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { PawButton } from '../ui/PawButton';
import { usePawPoints } from '../../context/PawPointsContext';

const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode; number: number }>((props, ref) => {
  return (
    <div ref={ref} className="page">
      <div style={{
        backgroundColor: '#fdf6e3', // Paper color
        border: '1px solid #e0d6c8',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05), 0 0 5px rgba(0,0,0,0.1)',
        padding: '2rem',
        height: '100%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}>
      {/* Spine shadow for realistic book fold */}
      <div style={{
        position: 'absolute',
        top: 0, bottom: 0, 
        right: props.number % 2 === 0 ? 0 : 'auto', 
        left: props.number % 2 !== 0 ? 0 : 'auto',
        width: '50px',
        background: props.number % 2 === 0 
          ? 'linear-gradient(to right, transparent, rgba(0,0,0,0.15))' 
          : 'linear-gradient(to left, transparent, rgba(0,0,0,0.15))',
        zIndex: 10,
        pointerEvents: 'none'
      }} />
        <div className="page-content">
          {props.children}
        </div>
        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', color: '#ccc' }}>
          {props.number}
import './JournalBook.css';

export const JournalBook: React.FC = () => {
  const [entry, setEntry] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { refreshUserData } = usePawPoints();

  const handleSave = async () => {
    if (!entry.trim()) return;
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:8000/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_text: entry }),
      });
      if (response.ok) {
        const data = await response.json();
        alert(`Entry saved! PawPal noticed you're feeling a bit ${data.sentiment}. +10 Paw Points!`);
        setEntry("");
        await refreshUserData();
      }
    } catch (error) {
      console.error("Failed to save journal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="journal-wrapper">
      <div className="journal-cover">
        <div className="journal-spine" />
        
        {/* Left Page */}
        <div className="journal-page left">
          <h2 style={{ color: '#5c4e4e', marginBottom: '1rem' }}>How are you feeling today?</h2>
          
          <div className="mood-grid">
            {['😊 Happy', '😌 Calm', '😔 Sad', '😰 Anxious', '😴 Tired'].map(mood => (
              <div key={mood} className="mood-chip">
                {mood}
              </div>
            ))}
          </div>
          
          <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>
            <p>🐾 Tip: Tracking your mood helps PawPal understand you better!</p>
          </div>
          
          <div className="page-number">1</div>
        </div>

        {/* Right Page */}
        <div className="journal-page right">
          <h2 style={{ color: '#5c4e4e', marginBottom: '1rem' }}>Dear PawPal...</h2>
          
          <textarea 
            className="journal-textarea"
            placeholder="Write whatever is on your mind. It's completely anonymous and safe here..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <PawButton onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save 🐾"}
            </PawButton>
          </div>
          
          <div className="page-number">2</div>
        </div>
      </div>
    </div>
  );
};
