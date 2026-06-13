import React, { useState, useEffect, useRef } from 'react';
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
        </div>
      </div>
    </div>
  );
});

export const JournalBook: React.FC = () => {
  const [entry, setEntry] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { refreshUserData } = usePawPoints();
  const inputAreaRef = useRef<HTMLDivElement>(null);

  // React synthetic events bubble too late (at the root) for react-pageflip's native listeners.
  // We must use a native DOM listener to stop propagation immediately, and we must do it in the CAPTURE phase.
  useEffect(() => {
    const el = inputAreaRef.current;
    if (!el) return;

    const stopEvent = (e: Event) => {
      e.stopPropagation();
    };

    el.addEventListener('pointerdown', stopEvent, { capture: true });
    el.addEventListener('mousedown', stopEvent, { capture: true });
    el.addEventListener('touchstart', stopEvent, { capture: true });
    el.addEventListener('wheel', stopEvent, { capture: true });

    return () => {
      el.removeEventListener('pointerdown', stopEvent, { capture: true });
      el.removeEventListener('mousedown', stopEvent, { capture: true });
      el.removeEventListener('touchstart', stopEvent, { capture: true });
      el.removeEventListener('wheel', stopEvent, { capture: true });
    };
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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      marginTop: '2rem',
      perspective: '1500px'
    }}>
      {/* Book Cover / Binding wrapper */}
      <div style={{
        backgroundColor: '#8b5a2b', // Leather brown
        padding: '15px 10px',
        borderRadius: '15px',
        boxShadow: 'inset 4px 0 10px rgba(255,255,255,0.1), inset -4px 0 10px rgba(0,0,0,0.4), 0 20px 50px rgba(0,0,0,0.4)',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        minWidth: '900px' // Force cover to be wide enough for two pages
      }}>
        {/* Book Spine Center */}
        <div style={{
          position: 'absolute',
          top: 0, bottom: 0, left: '50%',
          width: '40px',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0.1) 20%, rgba(0,0,0,0.2) 50%, rgba(255,255,255,0.1) 80%, rgba(0,0,0,0.4) 100%)',
          zIndex: 0
        }} />

        {/* @ts-ignore - react-pageflip typings are occasionally problematic */}
        <HTMLFlipBook 
          width={450} 
          height={550} 
          size="stretch"
          minWidth={400}
          maxWidth={500}
          minHeight={500}
          maxHeight={650}
          drawShadow={true}
          flippingTime={1000}
          showCover={false}
          usePortrait={false} // Force 2-page landscape mode
          useMouseEvents={false} // Disables drag-to-flip so inputs work perfectly
          className="journal-book"
          style={{ zIndex: 1 }}
        >
        <Page number={1}>
          <h2 style={{ color: '#5c4e4e', marginBottom: '1rem' }}>How are you feeling today?</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {['😊 Happy', '😌 Calm', '😔 Sad', '😰 Anxious', '😴 Tired'].map(mood => (
              <div key={mood} style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ffd1dc',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#5c4e4e'
              }}>
                {mood}
              </div>
            ))}
          </div>
          <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>
            <p>🐾 Tip: Tracking your mood helps PawPal understand you better!</p>
          </div>
        </Page>
        <Page number={2}>
          <h2 style={{ color: '#5c4e4e', marginBottom: '1rem' }}>Dear PawPal...</h2>
          <div ref={inputAreaRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <textarea 
              style={{
                width: '100%',
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                resize: 'none',
                fontSize: '1.1rem',
                lineHeight: '32px', // Match gradient lines
                fontFamily: "'Nunito', sans-serif",
                color: '#3b3131',
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #d5c8b5 31px, #d5c8b5 32px)',
                paddingTop: '6px',
                userSelect: 'text',
                WebkitUserSelect: 'text',
                pointerEvents: 'auto',
                cursor: 'text'
              }}
              placeholder="Write whatever is on your mind. It's completely anonymous and safe here..."
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <PawButton onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save 🐾"}
              </PawButton>
            </div>
          </div>
        </Page>
      </HTMLFlipBook>
      </div>
    </div>
  );
};
