import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill, Sequence, staticFile } from 'remotion';

export type FeatureSlideProps = {
  title: string;
  features: string[];
  primaryColor: string;
  imageFile?: string;
};

const getImageSrc = (imageFile?: string) => {
  if (!imageFile) return '';
  if (typeof window !== 'undefined' && (window as any).remotion_isStudio) {
    return staticFile(imageFile);
  }
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${basePath}/${imageFile}`;
};

export const FeatureSlide: React.FC<FeatureSlideProps> = ({ title, features, primaryColor, imageFile }) => {
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
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        padding: '80px 120px',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Semi-transparent backdrop */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(15, 16, 20, 0.75)',
        backdropFilter: 'blur(8px)',
      }} />

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
          position: 'relative',
        }}
      >
        {title}
      </h1>

      <div style={{ display: 'flex', gap: '60px', flex: 1, position: 'relative', alignItems: 'center' }}>
        {/* Bullet points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', flex: 1 }}>
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
                  fontSize: imageFile ? '2rem' : '2.5rem',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.85)',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: primaryColor,
                    boxShadow: `0 0 20px ${primaryColor}80`,
                    transform: 'rotate(45deg)', // Diamond bullet
                    flexShrink: 0,
                  }}
                />
                <span>{feature}</span>
              </div>
            );
          })}
        </div>

        {/* Optional image */}
        {imageFile && (
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            <img
              src={getImageSrc(imageFile)}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${primaryColor}20`,
              }}
            />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
