import React, { useState, useEffect } from 'react';
import { PawButton } from '../ui/PawButton';
import { usePawPoints } from '../../context/PawPointsContext';
import { Dog2D } from '../scene/Dog2D';
import { PawPrint } from 'lucide-react';
import './JournalBook.css';

const DAILY_PROMPTS = [
  "🌷 What is one small victory you had today?",
  "🐶 What made you smile today?",
  "✨ What's something you're looking forward to?",
  "🌿 How did you show yourself kindness today?",
  "☀️ Describe a moment today when you felt at peace."
];

const MOODS = [
  { id: 'Happy', label: 'Happy', expression: 'excited', message: "That makes my tail wag!" },
  { id: 'Calm', label: 'Calm', expression: 'loving', message: "It's so peaceful right now..." },
  { id: 'Sad', label: 'Sad', expression: 'sad', message: "I'm here for you. You're not alone." },
  { id: 'Anxious', label: 'Anxious', expression: 'anxious', message: "Let's take things one paw-step at a time." },
  { id: 'Tired', label: 'Tired', expression: 'sleepy', message: "You've worked hard today. Rest up." }
];

export const JournalBook: React.FC = () => {
  const [entry, setEntry] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [selectedMood, setSelectedMood] = useState<typeof MOODS[0] | null>(null);
  const [prompt, setPrompt] = useState("");
  
  const { refreshUserData } = usePawPoints();

  useEffect(() => {
    // Pick a random prompt once on load
    setPrompt(DAILY_PROMPTS[Math.floor(Math.random() * DAILY_PROMPTS.length)]);
  }, []);

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
        setShowStamp(true);
        // Let the stamp animation play for 1.5s
        setTimeout(async () => {
          setShowStamp(false);
          setEntry("");
          setSelectedMood(null);
          alert("PawPal says: Thank you for sharing with me today! 🐾");
          await refreshUserData();
        }, 1500);
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
        <div className="ribbon" />
        
        {/* Left Page */}
        <div className="journal-page left">
          <h2 className="handwritten" style={{ marginBottom: '1.5rem' }}>How are you feeling?</h2>
          
          <div className="mood-grid">
            {MOODS.map(mood => (
              <button 
                key={mood.id} 
                className={`mood-paw-card ${selectedMood?.id === mood.id ? 'selected' : ''}`}
                onClick={() => setSelectedMood(mood)}
              >
                <PawPrint size={18} /> {mood.label}
              </button>
            ))}
          </div>
          
          <div className="daily-prompt-card">
            <h3 style={{ fontSize: '1.1rem', opacity: 0.7, marginBottom: '0.5rem' }}>Today's Prompt</h3>
            <p style={{ fontSize: '1.3rem', color: '#5c4e4e' }}>{prompt}</p>
          </div>

          <div className="journal-dog-container">
             {selectedMood && (
                <div className="dog-speech-bubble" key={selectedMood.id}>
                  {selectedMood.message}
                </div>
             )}
             <Dog2D 
               expression={selectedMood ? selectedMood.expression : 'curious'} 
               action={selectedMood ? (selectedMood.id === 'Happy' ? 'excited_jump' : 'tail_wag') : 'head_tilt'} 
             />
          </div>
          
          <div className="page-number">1</div>
        </div>

        {/* Right Page */}
        <div className="journal-page right">
          {showStamp && (
            <div className="paw-stamp">
               <PawPrint size={150} fill="currentColor" strokeWidth={0} />
            </div>
          )}

          <h2 className="handwritten" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Dear PawPal... ✨</span>
            <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>{new Date().toLocaleDateString()}</span>
          </h2>
          
          <textarea 
            className="journal-textarea"
            placeholder="Write whatever is on your mind. It's safe here..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', zIndex: 10 }}>
            <PawButton onClick={handleSave} disabled={isSaving || showStamp}>
              {isSaving ? "Saving..." : "Save Entry"}
            </PawButton>
          </div>
          
          <div className="page-number">2</div>
        </div>
      </div>
    </div>
  );
};
