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
        backgroundColor: '#D9D6D6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'black',
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
          padding: '20px 40px',
          backgroundColor: '#BAFF00',
          color: 'black',
          borderRadius: '100px',
          fontSize: '2.5rem',
          fontWeight: 700,
          boxShadow: `0 20px 40px ${primaryColor}40`,
          transform: `scale(${interpolate(scaleSpring, [0, 1], [0.5, 1], { extrapolateLeft: 'clamp' })})`,
          opacity: interpolate(frame, [15, 25], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        {url}
      </div>
    </AbsoluteFill>
  );
};
