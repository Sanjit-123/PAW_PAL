import React, { useState } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { FurCard } from '../ui/FurCard';
import { Bone, Heart, Activity } from 'lucide-react';

interface MiniGameProps {
  onPlayAction: (action: string, expression: string) => void;
}

export const MiniGame: React.FC<MiniGameProps> = ({ onPlayAction }) => {
  const [items, setItems] = useState<{id: number, emoji: string}[]>([]);

  const handleAction = (action: string, expression: string, emoji: string) => {
    onPlayAction(action, expression);
    
    // Spawn floating emoji
    const newItem = { id: Date.now(), emoji };
    setItems(prev => [...prev, newItem]);
    
    // Remove after animation finishes
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== newItem.id));
    }, 1500);
  };

  const transitions = useTransition(items, {
    from: { opacity: 1, transform: 'translateY(50px) scale(0) rotate(0deg)' },
    enter: { opacity: 1, transform: 'translateY(-20px) scale(2) rotate(20deg)' },
    leave: { opacity: 0, transform: 'translateY(-80px) scale(1) rotate(45deg)' },
    config: { tension: 300, friction: 15 }
  });

  return (
    <FurCard style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '1rem', overflow: 'hidden' }}>
      
      {/* Floating Emojis */}
      {transitions((style, item) => (
        <animated.div style={{ ...style, position: 'absolute', top: '20%', left: '45%', fontSize: '2.5rem', zIndex: 10, pointerEvents: 'none' }}>
          {item.emoji}
        </animated.div>
      ))}

      <h2 style={{ fontSize: '1.5rem', color: '#5c4e4e', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1 }}>
        <Activity size={24} /> Play Area
      </h2>
      <p style={{ color: '#8c7e7e', zIndex: 1 }}>Take a break and interact with PawPal!</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', zIndex: 1 }}>
        <button 
          className="paw-button"
          onClick={() => handleAction('excited_jump', 'excited', '🎾')}
          style={{ width: '100%', justifyContent: 'flex-start', fontSize: '1.1rem', transition: 'transform 0.1s ease-in-out' }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
           🎾 Throw Ball
        </button>

        <button 
          className="paw-button"
          onClick={() => handleAction('spin', 'playful', '🦴')}
          style={{ width: '100%', justifyContent: 'flex-start', background: '#d1ead1', fontSize: '1.1rem', transition: 'transform 0.1s ease-in-out' }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Bone size={20} /> Give Treat
        </button>

        <button 
          className="paw-button"
          onClick={() => handleAction('tail_wag', 'loving', '❤️')}
          style={{ width: '100%', justifyContent: 'flex-start', background: '#ffd1dc', fontSize: '1.1rem', transition: 'transform 0.1s ease-in-out' }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart size={20} /> Belly Rub
        </button>
      </div>
    </FurCard>
  );
};
