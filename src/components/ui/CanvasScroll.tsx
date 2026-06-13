import React, { useRef, useEffect } from 'react';

interface CanvasScrollProps {
  frameCount: number;
  framePath: (index: number) => string;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const CanvasScroll: React.FC<CanvasScrollProps> = ({ frameCount, framePath, scrollContainerRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const targetFrameRef = useRef(0);
  const paintedFrameRef = useRef(-1);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Optimize canvas by disabling alpha channel since we draw full opaque frames
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;
    
    // Size canvas exactly to window to prevent expensive scaling during draw
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      paintedFrameRef.current = -1; // Force a redraw
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Render loop decoupled from scroll events
    const renderLoop = () => {
      const target = targetFrameRef.current;
      if (target !== paintedFrameRef.current) {
        const img = imagesRef.current[target];
        if (img && img.complete) {
          // Use Math.min to contain the image entirely within the window (zoomed out to fit)
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
          const drawW = img.width * scale;
          const drawH = img.height * scale;
          const x = (canvas.width / 2) - (drawW / 2);
          const y = (canvas.height / 2) - (drawH / 2);
          
          // Draw image to sample the top-left pixel (10px padding for safety)
          context.drawImage(img, x, y, drawW, drawH);
          
          try {
            const p = context.getImageData(x + 10, y + 10, 1, 1).data;
            // Clear and fill the background with the exact sampled color to hide seams
            context.fillStyle = `rgb(${p[0]}, ${p[1]}, ${p[2]})`;
            context.fillRect(0, 0, canvas.width, canvas.height);
          } catch (e) {
            // Fallback if cross-origin taint happens (shouldn't locally)
            context.fillStyle = '#fcf9f2';
            context.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          // Draw image again over the seamless background
          context.drawImage(img, x, y, drawW, drawH);
          paintedFrameRef.current = target;
        }
      }
      rafIdRef.current = requestAnimationFrame(renderLoop);
    };
    rafIdRef.current = requestAnimationFrame(renderLoop);

    // Batched preloading to prevent network and main-thread freezing
    let isCancelled = false;
    const preloadImages = async () => {
      imagesRef.current = new Array(frameCount).fill(null);
      const batchSize = 10;
      for (let i = 0; i < frameCount; i += batchSize) {
        if (isCancelled) return;
        const batch = [];
        for (let j = 0; j < batchSize && i + j < frameCount; j++) {
          const index = i + j + 1; // Frames are 1-indexed
          const promise = new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.src = framePath(index);
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img); // Resolve anyway to continue
          });
          batch.push(promise.then(img => {
            imagesRef.current[index - 1] = img;
          }));
        }
        await Promise.all(batch);
      }
    };
    preloadImages();
    
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      const scrollTop = container.scrollTop;
      const maxScrollTop = container.scrollHeight - container.clientHeight;
      
      const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScrollTop));
      targetFrameRef.current = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount)
      );
    };
    
    const container = scrollContainerRef.current;
    if (container) {
      // Use passive listener for better scroll performance
      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }
    
    return () => {
      isCancelled = true;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (container) container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateCanvasSize);
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
        pointerEvents: 'none'
      }}
    />
  );
};
