import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';

export type OutroSlideProps = {
  text: string;
  url: string;
  primaryColor: string;
};

export const OutroSlide: React.FC<OutroSlideProps> = ({ text, url, primaryColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleSpring = spring({
    fps,
    frame: frame - 15,
    config: { damping: 15, stiffness: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          width: '100vw',
          height: '100vh',
          position: 'absolute',
          background: `radial-gradient(circle at center, ${primaryColor}20 0%, transparent 60%)`,
          opacity: interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      />

      <h1
        style={{
          fontSize: '5rem',
          fontWeight: 900,
          fontFamily: '"Pixelify Sans", Inter, sans-serif',
          marginBottom: '24px',
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `translateY(${interpolate(frame, [0, 20], [50, 0], { extrapolateRight: 'clamp' })})`,
        }}
      >
        {text}
      </h1>

      <div
        style={{
          padding: '24px 50px',
          backgroundColor: '#BAFF00',
          color: '#0a0a0a',
          borderRadius: '100px',
          fontSize: '2.5rem',
          fontWeight: 800,
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: '0.02em',
          boxShadow: `0 20px 40px ${primaryColor}40, 0 0 60px ${primaryColor}30`,
          transform: `scale(${interpolate(scaleSpring, [0, 1], [0.5, 1], { extrapolateLeft: 'clamp' })})`,
          opacity: interpolate(frame, [15, 25], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        <a
          href={`https://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#0a0a0a', textDecoration: 'none' }}
        >
          {url}
        </a>
      </div>
    </AbsoluteFill>
  );
};
