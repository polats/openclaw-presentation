import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill, Sequence } from 'remotion';

export type FeatureSlideProps = {
  title: string;
  features: string[];
  primaryColor: string;
};

export const FeatureSlide: React.FC<FeatureSlideProps> = ({ title, features, primaryColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation for the title
  const titleY = spring({
    fps,
    frame,
    config: { damping: 10, stiffness: 100 },
    from: -50,
    to: 0,
  });

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#D9D6D6',
        display: 'flex',
        flexDirection: 'column',
        padding: '80px 120px',
        color: 'black',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '50%', height: '50%', background: `radial-gradient(circle, ${primaryColor}30 0%, transparent 70%)`, filter: 'blur(100px)' }} />

      <h1
        style={{
          fontSize: '4rem',
          fontWeight: 800,
          fontFamily: '"Pixelify Sans", Inter, sans-serif',
          marginBottom: '60px',
          textTransform: 'uppercase',
          borderBottom: `4px solid ${primaryColor}`,
          paddingBottom: '16px',
          width: 'fit-content',
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
        }}
      >
        {title}
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '40px' }}>
        {features.map((feature, index) => {
          // Stagger the entrance of each feature by 15 frames
          const featureFrame = frame - (index * 15 + 15);
          
          const featureX = spring({
            fps,
            frame: featureFrame,
            config: { damping: 12, stiffness: 120 },
            from: 100,
            to: 0,
          });

          const featureOpacity = interpolate(featureFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                transform: `translateX(${featureX}px)`,
                opacity: featureOpacity,
                fontSize: '2.5rem',
                fontWeight: 500,
                color: '#333333',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: primaryColor,
                  boxShadow: `0 0 20px ${primaryColor}80`,
                  transform: 'rotate(45deg)', // Diamond bullet
                }}
              />
              <span>{feature}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
