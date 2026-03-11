import React, { useEffect, useRef } from 'react';
import { AbsoluteFill, useCurrentFrame, staticFile, useVideoConfig } from 'remotion';

export const StarSlide: React.FC<{
  primaryColor?: string;
  secondaryColor?: string;
}> = ({ primaryColor = '#BAFF00', secondaryColor = '#D9D6D6' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // use fps to determine time
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<any[]>([]);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to match container
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Only load image and initialize particles once
    if (!isInitializedRef.current) {
      const img = new Image();
      img.src = staticFile('allstars.png');
      img.onload = () => {
        const scale = Math.min(rect.width / img.width, rect.height / img.height);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = Math.max(1, Math.round(img.width * scale));
        tempCanvas.height = Math.max(1, Math.round(img.height * scale));
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        const offsetX = (rect.width - tempCanvas.width) / 2;
        const offsetY = (rect.height - tempCanvas.height) / 2;

        tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const pixels = imageData.data;
        const width = tempCanvas.width;
        const height = tempCanvas.height;

        const bayerMatrix = [
          [0.0 / 16.0, 8.0 / 16.0, 2.0 / 16.0, 10.0 / 16.0],
          [12.0 / 16.0, 4.0 / 16.0, 14.0 / 16.0, 6.0 / 16.0],
          [3.0 / 16.0, 11.0 / 16.0, 1.0 / 16.0, 9.0 / 16.0],
          [15.0 / 16.0, 7.0 / 16.0, 13.0 / 16.0, 5.0 / 16.0]
        ];

        const stepSize = 2;
        const particles = [];

        for (let x = 0; x < width; x += stepSize) {
          for (let y = 0; y < height; y += stepSize) {
            const i = (y * width + x) * 4;
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
        isInitializedRef.current = true;
      };
    }

    // --- Animation Logic based on Remotion frame ---
    // Instead of requestAnimationFrame, we strictly draw based on the current 'frame'.
    // We clear and redraw the particles.

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Synthesize a mouse position that sweeps across the screen over the first 3 seconds (90 frames)
    let synthesizedMouseX = -1000;
    let synthesizedMouseY = -1000;
    const sweepDuration = 90;
    
    if (frame < sweepDuration) {
        const progress = frame / sweepDuration;
        synthesizedMouseX = rect.width * progress;
        synthesizedMouseY = rect.height / 2 + Math.sin(progress * Math.PI * 2) * 200; // Waver up and down
    }
    
    // For a deterministic animation across frames, we ideally shouldn't rely on accumulating state (like velocity).
    // However, for this complex particle system, fully rewritable deterministic logic without state is extremely complex.
    // For a simple presentation component that plays linearly, we can approximate continuous state by 
    // re-evaluating velocities based on a fixed time step (`frame`). 
    // Note: Seeking backwards in the Remotion studio might look slightly glitchy with this approach, 
    // but forward playback will work fine.
    
    // Convert frame strictly to a time value to drive idle animations deterministically
    const time = frame / fps;

    particlesRef.current.forEach(particle => {
        // Idle animation based on global time (deterministic)
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
                // Pseudo-random deterministic values derived from position
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
            
            // Return logic
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

            // Friction
            particle.vel.x *= 0.95;
            particle.vel.y *= 0.95;
        }

        if (!particle.dispersed) {
            drawY += Math.sin(currentIdleTime) * particle.idleAmplitude;
            drawX += Math.sin(currentIdleTime * 0.7 + particle.bayerX) * particle.idleAmplitude * 0.5;
        }

        // Draw
        ctx.fillStyle = particle.isWhite ? primaryColor : secondaryColor;
        const offset = (particle.currentSize - particle.baseSize) / 2;
        ctx.fillRect(
            drawX - offset,
            drawY - offset,
            particle.currentSize,
            particle.currentSize
        );
    });

  }, [frame, fps, primaryColor, secondaryColor]); // Dependency on frame forces re-render/re-draw every Remotion tick

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
