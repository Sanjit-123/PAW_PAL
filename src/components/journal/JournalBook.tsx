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
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'stamped' | 'done'>('idle');
  const [selectedMood, setSelectedMood] = useState<typeof MOODS[0] | null>(null);
  const [prompt, setPrompt] = useState("");
  
  const { userData, refreshUserData } = usePawPoints();

  useEffect(() => {
    // Pick a random prompt once on load
    setPrompt(DAILY_PROMPTS[Math.floor(Math.random() * DAILY_PROMPTS.length)]);
  }, []);

  const handleSave = async () => {
    if (!entry.trim()) return;
    setSaveState('saving');
    
    try {
      const response = await fetch('http://localhost:8000/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_text: entry }),
      });
      
      if (response.ok) {
        setSaveState('stamped');
        // Let the stamp animation play for 1.5s
        setTimeout(async () => {
          setSaveState('done');
          await refreshUserData();
          
          // Reset after a bit
          setTimeout(() => {
            setSaveState('idle');
            setEntry("");
            setSelectedMood(null);
          }, 4000);
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to save journal:", error);
      setSaveState('idle');
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

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
                <PawPrint size={18} /> {mood.label} {selectedMood?.id === mood.id && '✨'}
              </button>
            ))}
          </div>
          
          <hr style={{ border: 'none', borderTop: '1px dashed rgba(139, 90, 43, 0.2)', margin: '1rem 0' }} />

          {selectedMood && (
             <div style={{ display: 'flex', gap: '15px', alignItems: 'center', margin: '1rem 0' }}>
               <div style={{ fontSize: '2rem' }}>🐶</div>
               <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.6rem', color: '#8b5a2b' }}>
                 "{selectedMood.message}"
               </div>
             </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px dashed rgba(139, 90, 43, 0.2)', margin: '1rem 0' }} />

          <div className="daily-prompt-card" style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', opacity: 0.7, marginBottom: '0.5rem' }}>Today's Prompt</h3>
            <p style={{ fontSize: '1.3rem', color: '#5c4e4e' }}>{prompt}</p>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff6b6b', fontWeight: 'bold' }}>
               <span>🔥 Journal Streak {userData?.streak_days || 0} Days</span>
             </div>
             <div style={{ color: '#8c7e7e', fontSize: '0.9rem' }}>Level 3: Cozy Companion</div>
          </div>
          
          <div className="page-number">1</div>
        </div>

        {/* Right Page */}
        <div className="journal-page right">
          {saveState === 'stamped' && (
            <div className="paw-stamp">
               <PawPrint size={150} fill="currentColor" strokeWidth={0} />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
            <h2 className="handwritten" style={{ margin: 0, position: 'relative' }}>
              Dear PawPal... 
              <span style={{ position: 'absolute', top: '-10px', right: '-25px', fontSize: '1.2rem', animation: 'float 3s infinite' }}>✨</span>
            </h2>
            <div className="handwritten" style={{ fontSize: '1.6rem', color: '#8b5a2b', opacity: 0.8 }}>
              {currentDate}
            </div>
          </div>
          
          <textarea 
            className="journal-textarea"
            placeholder="Write whatever is on your mind. It's safe here..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', zIndex: 10 }}>
            {saveState === 'done' ? (
              <div className="handwritten" style={{ fontSize: '1.8rem', color: '#8b5a2b' }}>
                 "Thank you for sharing with me today." 🐶
              </div>
            ) : <div />}
            
            <PawButton onClick={handleSave} disabled={saveState !== 'idle'} style={{ background: saveState === 'done' ? '#88d8b0' : undefined }}>
              {saveState === 'saving' ? "Saving..." : saveState === 'stamped' || saveState === 'done' ? "✓ Entry Saved 🐾" : "Save Entry"}
            </PawButton>
          </div>
          
          <div className="page-number">2</div>
        </div>
      </div>
      
      {/* Dog is now completely outside the journal pages, resting beside it */}
      <div className="journal-dog-container">
         <Dog2D 
           expression={saveState === 'saving' || saveState === 'stamped' ? 'excited' : (selectedMood ? selectedMood.expression : 'sleepy')} 
           action={saveState === 'saving' || saveState === 'stamped' ? 'excited_jump' : (selectedMood ? (selectedMood.id === 'Happy' ? 'spin' : 'tail_wag') : 'lie_down')} 
         />
      </div>
    </div>
  );
};
