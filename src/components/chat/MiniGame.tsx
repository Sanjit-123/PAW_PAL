import React, { useState } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { FurCard } from '../ui/FurCard';
import { Bone, Heart, Activity } from 'lucide-react';

interface MiniGameProps {
  onPlayAction: (action: string, expression: string) => void;
}

export const MiniGame: React.FC<MiniGameProps> = ({ onPlayAction }) => {
  const [items, setItems] = useState<{id: number, emoji: string, text: string, color: string}[]>([]);

  const handleAction = (action: string, expression: string, emoji: string, text: string, color: string) => {
    onPlayAction(action, expression);
    
    // Spawn floating emoji & text overlay
    const newItem = { id: Date.now(), emoji, text, color };
    setItems(prev => [...prev, newItem]);
    
    // Remove after animation finishes
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== newItem.id));
    }, 1500);
  };

  const transitions = useTransition(items, {
    from: { opacity: 1, transform: 'translateY(20px) scale(0.5)' },
    enter: { opacity: 1, transform: 'translateY(-60px) scale(1)' },
    leave: { opacity: 0, transform: 'translateY(-100px) scale(0.8)' },
    config: { tension: 280, friction: 20 }
  });

  return (
    <FurCard style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '1rem', overflow: 'hidden' }}>
      
      {/* Floating Emotional Feedback Overlay */}
      {transitions((style, item) => (
        <animated.div style={{ ...style, position: 'absolute', top: '10%', left: '-150px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 100, pointerEvents: 'none' }}>
          <span style={{ fontSize: '3rem' }}>{item.emoji}</span>
          <span style={{ background: item.color, color: 'white', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '5px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', whiteSpace: 'nowrap' }}>
            {item.text}
          </span>
        </animated.div>
      ))}

      <h2 style={{ fontSize: '1.4rem', color: '#5c4e4e', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1, margin: 0 }}>
        <Activity size={24} /> Play Area
      </h2>
      <p style={{ color: '#8c7e7e', zIndex: 1, fontSize: '0.95rem' }}>Take a break and bond with PawPal.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '0.5rem', zIndex: 1 }}>
        <button 
          className="paw-button"
          onClick={() => handleAction('excited_jump', 'excited', '🎾', '+10 Happiness', '#ff6b6b')}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', background: '#fcebf0', border: 'none', color: '#5c4e4e', transition: 'all 0.2s', borderRadius: '15px' }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(255, 209, 220, 0.8)'; e.currentTarget.style.filter = 'brightness(0.95)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.filter = 'brightness(1)'; }}
        >
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 'bold' }}>🎾 Throw Ball</div>
           <div style={{ fontSize: '0.85rem', color: '#8c7e7e', marginTop: '4px', fontWeight: 'normal' }}>PawPal loves fetch!</div>
        </button>

        <button 
          className="paw-button"
          onClick={() => handleAction('spin', 'playful', '🦴', '+5 Trust', '#88d8b0')}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', background: '#eafbe4', border: 'none', color: '#5c4e4e', transition: 'all 0.2s', borderRadius: '15px' }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(209, 234, 209, 0.8)'; e.currentTarget.style.filter = 'brightness(0.95)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.filter = 'brightness(1)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 'bold' }}>🦴 Give Treat</div>
          <div style={{ fontSize: '0.85rem', color: '#8c7e7e', marginTop: '4px', fontWeight: 'normal' }}>Reward today's progress!</div>
        </button>

        <button 
          className="paw-button"
          onClick={() => handleAction('tail_wag', 'loving', '💗', '+15 Bonding', '#feca57')}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', background: '#fae8eb', border: 'none', color: '#5c4e4e', transition: 'all 0.2s', borderRadius: '15px' }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(255, 182, 193, 0.6)'; e.currentTarget.style.filter = 'brightness(0.95)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.filter = 'brightness(1)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 'bold' }}>💗 Belly Rub</div>
          <div style={{ fontSize: '0.85rem', color: '#8c7e7e', marginTop: '4px', fontWeight: 'normal' }}>Instant comfort boost!</div>
        </button>
      </div>
    </FurCard>
  );
};
