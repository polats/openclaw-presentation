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

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#D9D6D6', // Cosmic Labs light silver background
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
            background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(240,240,245,0.9) 100%)',
            backdropFilter: 'blur(30px)',
            borderTop: `2px solid ${primaryColor}`,
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            borderLeft: '1px solid rgba(0, 0, 0, 0.05)',
            borderRight: '1px solid rgba(0, 0, 0, 0.05)',
            padding: '100px 140px',
            boxShadow: `0 30px 60px rgba(0,0,0,0.1), 0 0 50px ${primaryColor}60`,
            transform: 'translateZ(100px)', // Lift off heavily
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            minWidth: '800px',
            clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)', // Sharp, aggressive slant
          }}
        >
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
              background: `linear-gradient(180deg, #000000 0%, #333333 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 10px 20px rgba(0,0,0,0.2)`,
            }}
          >
            {titleText}
          </h1>
          
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 500,
              color: secondaryColor,
              fontFamily: '"Pixelify Sans", Inter, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              opacity: subtitleOpacity,
              transform: 'translateZ(25px)',
              textShadow: `0 0 20px ${secondaryColor}40`,
            }}
          >
            {subtitleText}
          </h2>
        </div>
      </div>
    </AbsoluteFill>
  );
};
