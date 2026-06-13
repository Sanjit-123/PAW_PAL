import React, { useState } from 'react';
import { useSpring, animated, config, to } from '@react-spring/web';
import { usePawPoints } from '../../context/PawPointsContext';

interface DogProps {
  expression?: string; // 'happy', 'sad', 'curious', 'sleepy', 'normal'
  action?: string;     // 'tail_wag', 'head_tilt', 'ears_down', 'excited_jump'
}

export const Dog2D: React.FC<DogProps> = ({ expression = 'normal', action = 'tail_wag' }) => {
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

  // Tail wagging animation on hover or action
  const isWagging = isHovered || action === 'tail_wag' || action === 'excited_jump';
  const { rotateZ } = useSpring({
    rotateZ: isWagging ? 20 : 0,
    loop: isWagging,
    config: config.wobbly,
  });

  // Ear twitching / posture
  const isEarsDown = action === 'ears_down' || expression === 'sad' || expression === 'sleepy' || expression === 'anxious';
  const isOneEarUp = expression === 'curious' && !isHovered;
  const isEarsPerked = action === 'ears_perk' || expression === 'shocked' || expression === 'excited';
  
  const { rotateEarLeft, rotateEarRight } = useSpring({
    rotateEarLeft: isEarsDown ? 30 : (isEarsPerked ? -45 : (isOneEarUp ? -30 : (isHovered ? -15 : 0))),
    rotateEarRight: isEarsDown ? -30 : (isEarsPerked ? 45 : (isHovered ? -15 : 0)),
    config: config.stiff,
  });

  // Head tilt & movement
  const isNodding = action === 'nod_yes';
  const isShaking = action === 'shake_no';
  
  const { rotateHead, headTranslateY, headTranslateX } = useSpring({
    rotateHead: action === 'head_tilt' || expression === 'confused' ? 15 : 0,
    headTranslateY: isNodding ? -10 : 0,
    headTranslateX: isShaking ? -5 : 0,
    loop: isNodding || isShaking ? { reverse: true } : false,
    config: { tension: 300, friction: 10 },
  });

  // Body movements (Jump, Spin, Lie Down, Shiver, Panting)
  const isJumping = action === 'excited_jump';
  const isLieDown = action === 'lie_down';
  const isShivering = action === 'shiver' || expression === 'anxious';
  const isSpinning = action === 'spin';
  const isPanting = action === 'panting';

  const { bodyTranslateY, bodyScaleY, bodyTranslateX, bodyRotateZ } = useSpring({
    bodyTranslateY: isJumping ? -30 : (isLieDown ? 20 : 0),
    bodyScaleY: isLieDown ? 0.7 : (isPanting ? 1.05 : 1),
    bodyTranslateX: isShivering ? -3 : 0,
    bodyRotateZ: isSpinning ? 360 : 0,
    loop: isJumping || isShivering || isPanting ? { reverse: true } : (isSpinning ? true : false),
    config: isShivering ? { tension: 800, friction: 10 } : (isPanting ? { tension: 500, friction: 15 } : config.wobbly),
  });

  // --- Expressions Styling ---
  const isSad = expression === 'sad';
  const isSleepy = expression === 'sleepy';
  const isShocked = expression === 'shocked';
  const isExcited = expression === 'excited';
  const isAngry = expression === 'angry';
  const isLoving = expression === 'loving';
  const isConfused = expression === 'confused';
  const isPlayful = expression === 'playful' || isPanting;
  const isAnxious = expression === 'anxious';

  // Eyes
  let eyeStyle: any = { height: '12px', width: '12px', borderRadius: '50%', top: '35px', background: '#333' };
  if (isSleepy || isLoving) {
    eyeStyle = { height: '4px', width: '12px', borderRadius: '2px', top: '40px', background: '#333' };
  } else if (isShocked || isExcited) {
    eyeStyle = { height: '18px', width: '18px', borderRadius: '50%', top: '32px', left: '27px', background: '#333' };
  } else if (isAnxious) {
    eyeStyle = { height: '10px', width: '10px', borderRadius: '50%', top: '36px', background: '#333' };
  }

  // Mouth
  let mouthContent = null;
  let mouthStyle: any = { borderBottom: '3px solid #333', borderRadius: '0 0 15px 15px', height: '15px', top: '65px', width: '30px', left: '45px' }; // default smile
  
  if (isSad) {
    mouthStyle = { borderTop: '3px solid #333', borderBottom: 'none', borderRadius: '15px 15px 0 0', top: '70px', height: '15px', width: '30px', left: '45px' };
  } else if (isSleepy || isAngry) {
    mouthStyle = { borderBottom: '3px solid #333', height: '0px', top: '70px', borderRadius: '0', width: '20px', left: '50px' };
  } else if (isShocked) {
    mouthStyle = { border: '3px solid #333', borderRadius: '50%', height: '12px', width: '12px', top: '70px', left: '54px' };
  } else if (isExcited || isPlayful) {
    // Open smile with tongue
    mouthStyle = { borderBottom: '3px solid #333', borderRadius: '0 0 15px 15px', height: '15px', top: '65px', width: '30px', left: '45px', overflow: 'visible' };
    mouthContent = (
      <div style={{ position: 'absolute', top: '12px', left: '10px', width: '10px', height: '15px', background: '#ff8a8a', borderRadius: '0 0 10px 10px' }} />
    );
  } else if (isConfused) {
    // angled straight mouth
    mouthStyle = { borderBottom: '3px solid #333', height: '0px', top: '70px', borderRadius: '0', width: '20px', left: '50px', transform: 'rotate(-15deg)' };
  }

  return (
    <animated.div 
      style={{ 
        position: 'relative', width: '200px', height: '200px', cursor: 'pointer', marginTop: hasBed ? '20px' : '0', 
        transform: to([bodyTranslateY, bodyTranslateX, bodyRotateZ], (y, x, rz) => `translateY(${y}px) translateX(${x}px) rotateZ(${rz}deg)`)
      }}
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
        transform: to([scaleY, bodyScaleY], (s, bs) => `scaleY(${s}) scaleY(${bs})`),
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
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
        transformOrigin: 'bottom center',
        transform: to([rotateHead, headTranslateY, headTranslateX], (r, y, x) => `rotateZ(${r}deg) translateY(${y}px) translateX(${x}px)`)
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
          transform: rotateEarLeft.to(r => `rotateZ(${r}deg)`)
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
          transform: rotateEarRight.to(r => `rotateZ(${r}deg)`)
        }} />

        {/* Eyes */}
        <animated.div style={{ position: 'absolute', left: '30px', ...eyeStyle }} />
        <animated.div style={{ position: 'absolute', right: '30px', ...eyeStyle }} />

        {/* Eyebrows (for Angry) */}
        {isAngry && (
          <>
            <div style={{ position: 'absolute', top: '25px', left: '30px', width: '15px', height: '3px', background: '#333', transform: 'rotate(20deg)' }} />
            <div style={{ position: 'absolute', top: '25px', right: '30px', width: '15px', height: '3px', background: '#333', transform: 'rotate(-20deg)' }} />
          </>
        )}
        {/* Eyebrows (for Sad) */}
        {isSad && (
          <>
            <div style={{ position: 'absolute', top: '25px', left: '30px', width: '15px', height: '3px', background: '#333', transform: 'rotate(-20deg)' }} />
            <div style={{ position: 'absolute', top: '25px', right: '30px', width: '15px', height: '3px', background: '#333', transform: 'rotate(20deg)' }} />
          </>
        )}

        {/* Nose */}
        <div style={{ position: 'absolute', top: '55px', left: '50px', width: '20px', height: '15px', background: '#444', borderRadius: '10px' }} />
        
        {/* Smile / Mouth */}
        <animated.div style={{ 
          position: 'absolute', 
          ...mouthStyle
        }}>
          {mouthContent}
        </animated.div>
      </animated.div>
    </animated.div>
  );
};
