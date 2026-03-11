import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';

export type CodeSlideProps = {
  title: string;
  codeText: string;
  primaryColor: string;
};

export const CodeSlide: React.FC<CodeSlideProps> = ({ title, codeText, primaryColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerSpring = spring({
    fps,
    frame,
    config: { damping: 14, stiffness: 110 },
  });

  // Calculate how many characters of the code snippet to show based on the frame
  // Start typing at frame 30, reveal 1 character per frame
  const charsShown = Math.max(0, Math.min(codeText.length, frame - 30));
  const currentCodeText = codeText.substring(0, charsShown);

  // Blinking cursor logic
  const cursorVisible = frame % 30 < 15;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#050508',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <h2
        style={{
          fontSize: '3rem',
          fontWeight: 700,
          fontFamily: '"Pixelify Sans", Inter, sans-serif',
          marginBottom: '40px',
          color: '#a1a3af',
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `translateY(${interpolate(frame, [0, 20], [20, 0], { extrapolateRight: 'clamp' })}px)`,
        }}
      >
        {title}
      </h2>

      <div
        style={{
          width: '80%',
          maxWidth: '1200px',
          backgroundColor: '#0d0d12',
          borderRadius: '16px',
          border: '1px solid #2d2f39',
          boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px ${primaryColor}20`,
          overflow: 'hidden',
          transform: `scale(${interpolate(containerSpring, [0, 1], [0.95, 1])})`,
          opacity: interpolate(frame, [10, 20], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        {/* Terminal Header */}
        <div style={{ display: 'flex', gap: '8px', padding: '16px 24px', backgroundColor: '#1a1b22', borderBottom: '1px solid #2d2f39' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
        </div>

        {/* Code Content */}
        <div style={{ padding: '40px', fontFamily: '"Fira Code", "JetBrains Mono", monospace', fontSize: '2rem', lineHeight: 1.5, color: '#e0e0e0' }}>
          <span style={{ color: primaryColor }}>$</span> {currentCodeText}
          <span style={{ opacity: cursorVisible ? 1 : 0, display: 'inline-block', width: '12px', height: '2.4rem', backgroundColor: 'white', verticalAlign: 'middle', marginLeft: '4px' }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
