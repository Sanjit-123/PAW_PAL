import React, { useEffect, useState } from 'react';
import { FurCard } from '../ui/FurCard';
import { PawButton } from '../ui/PawButton';
import { Mail, Sparkles, Loader2, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Letter {
  id: number;
  content: string;
  timestamp: string;
  read_status: number;
}

export const LettersView: React.FC = () => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  const fetchLetters = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/letters');
      if (res.ok) {
        const data = await res.json();
        setLetters(data);
        if (data.length > 0 && !selectedLetter) {
          setSelectedLetter(data[0]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch letters", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const handleGenerateLetter = async () => {
    setGenerating(true);
    try {
      const res = await fetch('http://localhost:8000/api/letters/generate', {
        method: 'POST'
      });
      if (res.ok) {
        const newLetter = await res.json();
        setLetters(prev => [newLetter, ...prev]);
        setSelectedLetter(newLetter);
      }
    } catch (e) {
      console.error("Failed to generate letter", e);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
        <Loader2 className="animate-spin" size={40} color="var(--primary-hover)" />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', gap: '2rem', height: '70vh' }}>
      
      {/* Sidebar - Letter List */}
      <FurCard style={{ width: '300px', display: 'flex', flexDirection: 'column', padding: '1.5rem', overflowY: 'hidden' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-hover)', marginBottom: '1.5rem' }}>
          <Mail size={24} /> My Mailbox
        </h2>
        
        <PawButton 
          onClick={handleGenerateLetter} 
          disabled={generating}
          style={{ marginBottom: '1.5rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
          {generating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {generating ? 'PawPal is writing...' : 'Request Weekly Letter'}
        </PawButton>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px' }}>
          {letters.length === 0 ? (
            <p style={{ textAlign: 'center', opacity: 0.6, fontSize: '0.9rem', marginTop: '2rem' }}>
              Your mailbox is empty. Request your first letter from PawPal!
            </p>
          ) : (
            letters.map((letter) => (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={letter.id}
                onClick={() => setSelectedLetter(letter)}
                style={{
                  padding: '1rem',
                  borderRadius: '15px',
                  backgroundColor: selectedLetter?.id === letter.id ? 'rgba(255,182,193,0.3)' : 'rgba(255,255,255,0.6)',
                  border: selectedLetter?.id === letter.id ? '2px solid var(--primary-hover)' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{ 
                  width: '40px', height: '40px', 
                  borderRadius: '50%', backgroundColor: 'white', 
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}>
                  <Heart size={20} color="var(--primary-hover)" fill={selectedLetter?.id === letter.id ? "var(--primary-hover)" : "transparent"} />
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#5c4e4e' }}>Letter from PawPal</div>
                  <div style={{ fontSize: '0.8rem', color: '#8c7e7e' }}>{format(new Date(letter.timestamp), 'MMM dd, yyyy')}</div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </FurCard>

      {/* Main Content - Letter Viewer */}
      <FurCard style={{ 
        flex: 1, 
        padding: '3rem', 
        position: 'relative',
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0.8))',
        boxShadow: 'inset 0 0 50px rgba(255,182,193,0.2)'
      }}>
        {/* Background stationery lines */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundSize: '100% 30px',
          backgroundImage: 'linear-gradient(to bottom, transparent 29px, rgba(0,0,0,0.05) 30px)',
          pointerEvents: 'none',
          borderRadius: 'inherit'
        }} />

        <AnimatePresence mode="wait">
          {selectedLetter ? (
            <motion.div
              key={selectedLetter.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#8c7e7e', marginBottom: '2rem', fontFamily: 'monospace' }}>
                {format(new Date(selectedLetter.timestamp), 'EEEE, MMMM do, yyyy')}
              </div>
              
              <div style={{ 
                flex: 1, 
                fontSize: '1.2rem', 
                lineHeight: '2.2', 
                color: '#4a4a4a',
                whiteSpace: 'pre-wrap',
                fontFamily: "'Comic Sans MS', 'Caveat', 'Patrick Hand', cursive, sans-serif" // A handwriting style fallback
              }}>
                {selectedLetter.content}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', opacity: 0.5, zIndex: 1, position: 'relative' }}
            >
              <Mail size={60} style={{ marginBottom: '1rem' }} />
              <h3>Select a letter to read</h3>
            </motion.div>
          )}
        </AnimatePresence>
      </FurCard>
    </div>
  );
};
