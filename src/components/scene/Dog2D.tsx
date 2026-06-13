import React, { useState } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { usePawPoints } from '../../context/PawPointsContext';

export const Dog2D: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { userData } = usePawPoints();
  const points = userData.paw_points;

  // Gamification Unlocks
  const hasCollar = points >= 50;
  const hasBed = points >= 100;

  // Breathing animation
  const { scaleY } = useSpring({
    from: { scaleY: 1 },
    to: async (next) => {
      while (true) {
        await next({ scaleY: 1.02 });
        await next({ scaleY: 1 });
      }
    },
    config: { duration: 1500 },
  });

  // Tail wagging animation on hover
  const { rotateZ } = useSpring({
    rotateZ: isHovered ? 20 : 0,
    loop: isHovered,
    config: config.wobbly,
  });

  // Ear twitching
  const { rotateEar } = useSpring({
    rotateEar: isHovered ? -15 : 0,
    config: config.stiff,
  });

  return (
    <div 
      style={{ position: 'relative', width: '200px', height: '200px', cursor: 'pointer', marginTop: hasBed ? '20px' : '0' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gamification Unlock: Pet Bed */}
      {hasBed && (
        <div style={{
          position: 'absolute',
          bottom: '-15px',
          left: '10px',
          width: '180px',
          height: '40px',
          background: '#d1ead1',
          borderRadius: '50%',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
        }} />
      )}

      {/* Dog Body */}
      <animated.div style={{
        position: 'absolute',
        bottom: 0,
        left: '25px',
        width: '150px',
        height: '120px',
        background: '#e0b896', // Light brown
        borderRadius: '50px 50px 20px 20px',
        transform: scaleY.to(s => `scaleY(${s})`),
        transformOrigin: 'bottom center',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Gamification Unlock: Red Collar */}
        {hasCollar && (
          <div style={{
            position: 'absolute',
            top: '0px',
            left: '25px',
            width: '100px',
            height: '15px',
            background: '#ff6b6b',
            borderRadius: '10px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 10
          }}>
             <div style={{ position: 'absolute', top: '15px', left: '45px', width: '10px', height: '10px', background: '#ffd1dc', borderRadius: '50%' }} />
          </div>
        )}
      </animated.div>

      {/* Tail */}
      <animated.div style={{
        position: 'absolute',
        bottom: '20px',
        right: '5px',
        width: '30px',
        height: '80px',
        background: '#c59d7b',
        borderRadius: '15px',
        transformOrigin: 'bottom center',
        transform: rotateZ.to(r => `rotateZ(${r}deg)`)
      }} />

      {/* Head */}
      <animated.div style={{
        position: 'absolute',
        top: '20px',
        left: '40px',
        width: '120px',
        height: '100px',
        background: '#e0b896',
        borderRadius: '60px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
      }}>
        {/* Left Ear */}
        <animated.div style={{
          position: 'absolute',
          top: '10px',
          left: '-10px',
          width: '30px',
          height: '70px',
          background: '#c59d7b',
          borderRadius: '15px',
          transformOrigin: 'top right',
          transform: rotateEar.to(r => `rotateZ(${r}deg)`)
        }} />

        {/* Right Ear */}
        <animated.div style={{
          position: 'absolute',
          top: '10px',
          right: '-10px',
          width: '30px',
          height: '70px',
          background: '#c59d7b',
          borderRadius: '15px',
          transformOrigin: 'top left',
          transform: rotateEar.to(r => `rotateZ(${-r}deg)`)
        }} />

        {/* Eyes */}
        <div style={{ position: 'absolute', top: '35px', left: '30px', width: '12px', height: '12px', background: '#333', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '35px', right: '30px', width: '12px', height: '12px', background: '#333', borderRadius: '50%' }} />

        {/* Nose */}
        <div style={{ position: 'absolute', top: '55px', left: '50px', width: '20px', height: '15px', background: '#444', borderRadius: '10px' }} />
        
        {/* Smile / Mouth */}
        <div style={{ 
          position: 'absolute', top: '65px', left: '45px', width: '30px', height: '15px', 
          borderBottom: '3px solid #333', borderRadius: '0 0 15px 15px' 
        }} />
      </animated.div>
    </div>
  );
};
