import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill, staticFile } from 'remotion';

export type DualScreenshotSlideProps = {
  title: string;
  images: { file: string; alt: string }[];
  subtitle?: string | React.ReactNode;
  primaryColor: string;
};

const getImageSrc = (file: string) => {
  if (typeof window !== 'undefined' && (window as any).remotion_isStudio) {
    return staticFile(file);
  }
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${basePath}/${file}`;
};

export const DualScreenshotSlide: React.FC<DualScreenshotSlideProps> = ({
  title,
  images,
  subtitle,
  primaryColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = spring({
    fps,
    frame,
    config: { damping: 10, stiffness: 100 },
    from: -30,
    to: 0,
  });

  const subtitleOpacity = interpolate(frame, [30, 45], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        padding: '30px 60px',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Backdrop */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(15, 16, 20, 0.8)',
        backdropFilter: 'blur(8px)',
      }} />

      {/* Title */}
      <h1
        style={{
          fontSize: '3rem',
          fontWeight: 800,
          fontFamily: '"Pixelify Sans", Inter, sans-serif',
          textTransform: 'uppercase',
          borderBottom: `4px solid ${primaryColor}`,
          paddingBottom: '12px',
          marginBottom: '16px',
          width: 'fit-content',
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          position: 'relative',
        }}
      >
        {title}
      </h1>

      {/* Images side by side */}
      <div style={{
        display: 'flex',
        gap: '24px',
        flex: 1,
        position: 'relative',
        minHeight: 0,
      }}>
        {images.map((img, i) => {
          const imgOpacity = interpolate(frame, [10 + i * 10, 20 + i * 10], [0, 1], { extrapolateRight: 'clamp' });
          const imgScale = spring({
            fps,
            frame: frame - (10 + i * 10),
            config: { damping: 14, stiffness: 100 },
            from: 0.9,
            to: 1,
          });
          return (
            <div
              key={img.file}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 0,
                opacity: imgOpacity,
                transform: `scale(${imgScale})`,
              }}
            >
              <img
                src={getImageSrc(img.file)}
                alt={img.alt}
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
          );
        })}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p style={{
          fontSize: '1.8rem',
          fontWeight: 400,
          color: 'rgba(255, 255, 255, 0.8)',
          marginTop: '12px',
          opacity: subtitleOpacity,
          position: 'relative',
          textAlign: 'center',
        }}>
          {subtitle}
        </p>
      )}
    </AbsoluteFill>
  );
};
