import React, { useRef } from 'react';
import { CanvasScroll } from './components/ui/CanvasScroll';
import { PawButton } from './components/ui/PawButton';
import { Sparkles, ArrowDown } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // The user provided 300 frames in 'public/pal home'
  const frameCount = 300;
  const framePath = (index: number) => {
    // Frames are formatted like 'ezgif-frame-001.png'
    const paddedIndex = String(index).padStart(3, '0');
    return `/pal home/ezgif-frame-${paddedIndex}.png`;
  };

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: '#fcf9f2', // Soft background in case frames are transparent
        position: 'relative'
      }}
    >
      <CanvasScroll 
        frameCount={frameCount} 
        framePath={framePath} 
        scrollContainerRef={containerRef} 
      />
      
      {/* Scrollable Content Container to drive the scrollbar (1500vh gives a very slow, cinematic scroll) */}
      <div style={{ height: '1500vh', position: 'relative', zIndex: 10 }}>
        
        {/* Intro Section - Top of Page */}
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '4rem', color: '#5c4e4e', textShadow: '0 4px 20px rgba(255,255,255,0.8)' }}>
            Meet PawPal
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#8c7e7e', marginTop: '1rem', textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}>
            Your AI companion for emotional wellness.
          </p>
          <div style={{ marginTop: 'auto', marginBottom: '2rem', animation: 'float 2s ease-in-out infinite', color: '#8c7e7e' }}>
            <p style={{ marginBottom: '0.5rem' }}>Scroll Down</p>
            <ArrowDown size={32} />
          </div>
        </div>

        {/* Middle Section */}
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '0 10vw' }}>
          <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '20px', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '2rem', color: '#5c4e4e' }}>Always Listening</h2>
            <p style={{ marginTop: '1rem', color: '#7a6a6a', fontSize: '1.1rem' }}>
              Whether you need to vent, journal, or just relax, PawPal is here to respond with empathy and care.
            </p>
          </div>
        </div>
        
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 10vw' }}>
          <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '20px', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '2rem', color: '#5c4e4e' }}>Grow Together</h2>
            <p style={{ marginTop: '1rem', color: '#7a6a6a', fontSize: '1.1rem' }}>
              Earn PawPoints for journaling and checking in. Use them to unlock new toys, beds, and collars!
            </p>
          </div>
        </div>

        {/* Final Section - Bottom of Page */}
        <div style={{ height: '1200vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '15vh' }}>
          <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', padding: '3rem', borderRadius: '30px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '2.5rem', color: '#5c4e4e', marginBottom: '1rem' }}>Ready to meet your new friend?</h2>
            <PawButton onClick={onEnter} style={{ fontSize: '1.3rem', padding: '1rem 3rem' }}>
              Enter PawPal <Sparkles size={24} style={{ marginLeft: '10px' }} />
            </PawButton>
          </div>
        </div>

      </div>

      {/* Glassmorphism Navigation Button (Fixed at Bottom Center) */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50
      }}>
        <button 
          onClick={onEnter}
          style={{
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            padding: '12px 24px',
            borderRadius: '30px',
            color: '#5c4e4e',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'}
        >
          Skip to Features <ArrowDown size={18} style={{ transform: 'rotate(-90deg)' }} />
        </button>
      </div>
    </div>
  );
};
