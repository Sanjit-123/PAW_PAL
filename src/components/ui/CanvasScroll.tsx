import React, { useRef, useEffect } from 'react';

interface CanvasScrollProps {
  frameCount: number;
  framePath: (index: number) => string;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const CanvasScroll: React.FC<CanvasScrollProps> = ({ frameCount, framePath, scrollContainerRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // We assume standard 16:9 1080p frames for high quality, it will scale via CSS object-fit
    canvas.width = 1920;
    canvas.height = 1080;
    
    const drawFrame = (index: number) => {
      const img = imagesRef.current[index];
      if (img && img.complete) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Fill canvas while maintaining aspect ratio (cover)
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;
        context.drawImage(img, x, y, img.width * scale, img.height * scale);
      }
    };

    // Preload images
    let loaded = 0;
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = framePath(i);
      img.onload = () => {
        loaded++;
        // Draw the very first frame immediately once loaded
        if (i === 1) {
          drawFrame(0);
        }
      };
      imagesRef.current.push(img);
    }
    
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      const scrollTop = container.scrollTop;
      const maxScrollTop = container.scrollHeight - container.clientHeight;
      
      const scrollFraction = scrollTop / maxScrollTop;
      const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount)
      );
      
      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        requestAnimationFrame(() => drawFrame(frameIndex));
      }
    };
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Run once on mount in case we start somewhat scrolled
      handleScroll();
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [frameCount, framePath, scrollContainerRef]);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        width: '100vw',
        height: '100vh',
        objectFit: 'cover',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.8 // Soften it slightly to overlay text
      }}
    />
  );
};
