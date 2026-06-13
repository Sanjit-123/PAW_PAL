import React from 'react';
import { FurCard } from '../ui/FurCard';
import { Bone, Heart, Activity } from 'lucide-react';

interface MiniGameProps {
  onPlayAction: (action: string, expression: string) => void;
}

export const MiniGame: React.FC<MiniGameProps> = ({ onPlayAction }) => {

  const handleAction = (action: string, expression: string) => {
    onPlayAction(action, expression);
  };

  return (
    <FurCard style={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '1rem' }}>
      <h2 style={{ fontSize: '1.5rem', color: '#5c4e4e', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Activity size={24} /> Play Area
      </h2>
      <p style={{ color: '#8c7e7e' }}>Take a break and interact with PawPal!</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <button 
          className="paw-button"
          onClick={() => handleAction('excited_jump', 'excited')}
          style={{ width: '100%', justifyContent: 'flex-start', fontSize: '1.1rem' }}
        >
           🎾 Throw Ball
        </button>

        <button 
          className="paw-button"
          onClick={() => handleAction('spin', 'playful')}
          style={{ width: '100%', justifyContent: 'flex-start', background: '#d1ead1', fontSize: '1.1rem' }}
        >
          <Bone size={20} /> Give Treat
        </button>

        <button 
          className="paw-button"
          onClick={() => handleAction('tail_wag', 'loving')}
          style={{ width: '100%', justifyContent: 'flex-start', background: '#ffd1dc', fontSize: '1.1rem' }}
        >
          <Heart size={20} /> Belly Rub
        </button>
      </div>
    </FurCard>
  );
};
