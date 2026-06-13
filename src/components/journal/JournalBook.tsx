import React, { useState } from 'react';
import { PawButton } from '../ui/PawButton';
import { usePawPoints } from '../../context/PawPointsContext';
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
