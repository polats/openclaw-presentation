import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';

export type TitleSlideProps = {
  titleText: string;
  subtitleText: string;
  primaryColor: string;
  secondaryColor: string;
};

export const TitleSlide: React.FC<TitleSlideProps> = ({
  titleText,
  subtitleText,
  primaryColor,
  secondaryColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Aggressive entrance spring for the glowing slash background
  const slashEntrance = spring({
    fps,
    frame,
    config: {
      damping: 15,
      mass: 0.8,
      stiffness: 150,
      overshootClamping: false,
    },
  });

  // Sharp snap entrance for the text container
  const boxEntrance = spring({
    fps,
    frame: frame - 10, // Text box snaps in slightly after the slash
    config: {
      damping: 10,
      stiffness: 180,
      mass: 0.5,
    },
  });

  // Aggressive 3D Rotation (Tilting down)
  const rotationRotateX = interpolate(frame, [0, 150], [45, -5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  // High contrast text fade
  const titleOpacity = interpolate(frame, [15, 25], [0, 1], { extrapolateRight: 'clamp' });
  const subtitleOpacity = interpolate(frame, [25, 35], [0, 1], { extrapolateRight: 'clamp' });

  // Shine sweep across the title text (starts after title fades in)
  const shinePosition = interpolate(frame, [30, 90], [-100, 200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Secondary subtle shine that loops
  const shineLoop = interpolate(frame % 120, [0, 120], [-100, 200]);
  const shineLoopOpacity = frame > 90 ? 0.3 : 0;

  // Glow pulse on the border after entrance
  const glowPulse = frame > 40
    ? 0.6 + Math.sin((frame - 40) * 0.08) * 0.4
    : interpolate(frame, [20, 40], [0, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1200px', // More aggressive perspective
        overflow: 'hidden',
      }}
    >
      {/* 3D Scene Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotateX(${rotationRotateX}deg) scale(${boxEntrance})`,
          transformStyle: 'preserve-3d',
          width: '100%',
          height: '100%',
        }}
      >
        {/* Aggressive Glowing "Claw Mark" Background */}
        <div
          style={{
            position: 'absolute',
            width: '150%',
            height: '400px',
            background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
            filter: 'blur(100px)',
            opacity: slashEntrance * 0.8,
            transform: `rotate(-15deg) scaleX(${slashEntrance}) translateZ(-100px)`,
          }}
        />

        {/* Central High-Contrast Text Area */}
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(15,16,20,0.85) 100%)',
            backdropFilter: 'blur(30px)',
            borderTop: `2px solid ${primaryColor}`,
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '100px 140px',
            boxShadow: `0 30px 60px rgba(0,0,0,0.4), 0 0 ${50 + glowPulse * 30}px ${primaryColor}${Math.round(glowPulse * 96).toString(16).padStart(2, '0')}`,
            transform: 'translateZ(100px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            minWidth: '800px',
            clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shine sweep overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(105deg, transparent ${shinePosition - 20}%, rgba(186,255,0,0.15) ${shinePosition}%, transparent ${shinePosition + 20}%)`,
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
          {/* Looping subtle shine */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(105deg, transparent ${shineLoop - 15}%, rgba(255,255,255,${shineLoopOpacity}) ${shineLoop}%, transparent ${shineLoop + 15}%)`,
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
          <h1
            style={{
              fontSize: '6rem',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: '24px',
              fontFamily: '"Pixelify Sans", Inter, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              opacity: titleOpacity,
              transform: 'translateZ(50px)',
              backgroundImage: `linear-gradient(105deg, #ffffff ${shinePosition - 30}%, ${primaryColor} ${shinePosition}%, #ffffff ${shinePosition + 30}%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {titleText}
          </h1>
          
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: '"Pixelify Sans", Inter, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              opacity: subtitleOpacity,
              transform: 'translateZ(25px)',
              textShadow: `0 0 20px ${primaryColor}40`,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {subtitleText}
          </h2>
        </div>
      </div>
    </AbsoluteFill>
  );
};
