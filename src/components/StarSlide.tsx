import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AbsoluteFill, useCurrentFrame, staticFile, useVideoConfig } from 'remotion';

const getImageSrc = () => {
  // In Remotion Studio, window.remotion_isStudio is set
  if (typeof window !== 'undefined' && (window as any).remotion_isStudio) {
    return staticFile('allstars.png');
  }
  // In Next.js (GitHub Pages), use basePath
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${basePath}/allstars.png`;
};

export const StarSlide: React.FC<{
  primaryColor?: string;
  secondaryColor?: string;
}> = ({ primaryColor = '#BAFF00', secondaryColor = '#D9D6D6' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<any[]>([]);
  const isInitializedRef = useRef(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [particlesReady, setParticlesReady] = useState(false);

  // Track container size with ResizeObserver so we re-render when layout is ready
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Load image and create particles once we have valid container dimensions
  const initParticles = useCallback((width: number, height: number) => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = getImageSrc();
    img.onload = () => {
      const scale = Math.min(width / img.width, height / img.height);
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = Math.max(1, Math.round(img.width * scale));
      tempCanvas.height = Math.max(1, Math.round(img.height * scale));
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      const offsetX = (width - tempCanvas.width) / 2;
      const offsetY = (height - tempCanvas.height) / 2;

      tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const pixels = imageData.data;
      const imgW = tempCanvas.width;
      const imgH = tempCanvas.height;

      const bayerMatrix = [
        [0.0 / 16.0, 8.0 / 16.0, 2.0 / 16.0, 10.0 / 16.0],
        [12.0 / 16.0, 4.0 / 16.0, 14.0 / 16.0, 6.0 / 16.0],
        [3.0 / 16.0, 11.0 / 16.0, 1.0 / 16.0, 9.0 / 16.0],
        [15.0 / 16.0, 7.0 / 16.0, 13.0 / 16.0, 5.0 / 16.0]
      ];

      const stepSize = 2;
      const particles = [];

      for (let x = 0; x < imgW; x += stepSize) {
        for (let y = 0; y < imgH; y += stepSize) {
          const i = (y * imgW + x) * 4;
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          if (a < 128) continue;

          const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

          if (luminance > 0.05) {
            const bayerX = Math.floor(x / stepSize) % 4;
            const bayerY = Math.floor(y / stepSize) % 4;
            const bayerValue = bayerMatrix[bayerY][bayerX];

            const normalizedLuminance = Math.pow(luminance, 0.8);
            const shouldCreateParticle = normalizedLuminance > bayerValue;

            if (shouldCreateParticle) {
              const isWhite = luminance > 0.5 + (bayerValue - 0.5) * 0.5;
              if (isWhite || bayerValue > 0.3) {
                particles.push({
                  pos: { x: x + offsetX, y: y + offsetY },
                  origin: { x: x + offsetX, y: y + offsetY },
                  vel: { x: 0, y: 0 },
                  dispersed: false,
                  isStatic: false,
                  isWhite,
                  baseSize: 2,
                  maxSize: 3,
                  currentSize: 2,
                  bayerX,
                  bayerY,
                  idleTime: Math.random() * Math.PI * 2,
                  idleSpeed: 0.8 + Math.random() * 0.6,
                  idleAmplitude: 4 + Math.random() * 4,
                });
              }
            }
          }
        }
      }
      particlesRef.current = particles;
      setParticlesReady(true);
    };
  }, [setParticlesReady]);

  // Initialize particles when container size is available
  useEffect(() => {
    if (containerSize.width > 0 && containerSize.height > 0) {
      initParticles(containerSize.width, containerSize.height);
    }
  }, [containerSize, initParticles]);

  // Draw particles every frame
  useEffect(() => {
    if (!canvasRef.current || containerSize.width === 0 || containerSize.height === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = containerSize.width;
    canvas.height = containerSize.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Synthesize a mouse position that sweeps across the screen over the first 3 seconds (90 frames)
    let synthesizedMouseX = -1000;
    let synthesizedMouseY = -1000;
    const sweepDuration = 90;

    if (frame < sweepDuration) {
        const progress = frame / sweepDuration;
        synthesizedMouseX = containerSize.width * progress;
        synthesizedMouseY = containerSize.height / 2 + Math.sin(progress * Math.PI * 2) * 200;
    }

    const time = frame / fps;

    particlesRef.current.forEach(particle => {
        const currentIdleTime = particle.idleTime + time * particle.idleSpeed * 2;

        let drawX = particle.pos.x;
        let drawY = particle.pos.y;

        // Dispersion logic
        const dispersionRadius = 150;
        const dx = synthesizedMouseX - particle.pos.x;
        const dy = synthesizedMouseY - particle.pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < dispersionRadius) {
            if (!particle.dispersed) {
                const impact = 1 - distance / dispersionRadius;
                const angle = Math.atan2(dy, dx);
                const noiseX = Math.sin(particle.origin.x) * 2 - 1;
                const noiseY = Math.cos(particle.origin.y) * 2 - 1;

                particle.vel.x = (-Math.cos(angle) * 4 + noiseX * 2) * impact;
                particle.vel.y = (-Math.sin(angle) * 4 + noiseY * 2) * impact;
                particle.dispersed = true;
                particle.currentSize = particle.baseSize + (particle.maxSize - particle.baseSize) * ((Math.sin(particle.origin.x)+1)/2);
            }
        }

        if (particle.dispersed) {
            particle.pos.x += particle.vel.x;
            particle.pos.y += particle.vel.y;

            if (distance > dispersionRadius * 1.5) {
                const returnX = particle.origin.x - particle.pos.x;
                const returnY = particle.origin.y - particle.pos.y;
                const returnDist = Math.sqrt(returnX * returnX + returnY * returnY);

                if (returnDist > 2) {
                    particle.vel.x += returnX * 0.05;
                    particle.vel.y += returnY * 0.05;
                } else {
                    particle.pos.x = particle.origin.x;
                    particle.pos.y = particle.origin.y;
                    particle.vel.x = 0;
                    particle.vel.y = 0;
                    particle.dispersed = false;
                    particle.currentSize = particle.baseSize;
                }
            }

            particle.vel.x *= 0.95;
            particle.vel.y *= 0.95;
        }

        if (!particle.dispersed) {
            drawY += Math.sin(currentIdleTime) * particle.idleAmplitude;
            drawX += Math.sin(currentIdleTime * 0.7 + particle.bayerX) * particle.idleAmplitude * 0.5;
        }

        ctx.fillStyle = particle.isWhite ? primaryColor : secondaryColor;
        const offset = (particle.currentSize - particle.baseSize) / 2;
        ctx.fillRect(
            drawX - offset,
            drawY - offset,
            particle.currentSize,
            particle.currentSize
        );
    });

  }, [frame, fps, primaryColor, secondaryColor, containerSize, particlesReady]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f1014' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </AbsoluteFill>
  );
};
