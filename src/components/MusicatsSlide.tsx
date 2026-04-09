import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill, staticFile } from 'remotion';

export type MusicatsSlideProps = {
  primaryColor: string;
};

const getImageSrc = (file: string) => {
  if (typeof window !== 'undefined' && (window as any).remotion_isStudio) {
    return staticFile(file);
  }
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${basePath}/${file}`;
};

const IMAGES = [
  { file: 'supercell/musicats1.png', alt: 'Musicats 1' },
  { file: 'supercell/musicats2.png', alt: 'Musicats 2' },
  { file: 'supercell/musicats3.png', alt: 'Musicats 3' },
];

export const MusicatsSlide: React.FC<MusicatsSlideProps> = ({ primaryColor }) => {
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
          fontFamily: '"Space Grotesk", Inter, sans-serif',
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
        musicats.soulcats.space
      </h1>

      {/* 3 images side by side */}
      <div style={{
        display: 'flex',
        gap: '24px',
        flex: 1,
        position: 'relative',
        minHeight: 0,
      }}>
        {IMAGES.map((img, i) => {
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
      <p style={{
        fontSize: '1.8rem',
        fontWeight: 400,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: '12px',
        opacity: interpolate(frame, [30, 45], [0, 1], { extrapolateRight: 'clamp' }),
        position: 'relative',
        textAlign: 'center',
      }}>
        Strudel + UGC + music skills on{' '}
        <a href="https://musicats.soulcats.space" target="_blank" rel="noopener noreferrer" style={{ color: primaryColor, textDecoration: 'underline', textUnderlineOffset: '6px', fontWeight: 600 }}>
          musicats.soulcats.space
        </a>
      </p>
    </AbsoluteFill>
  );
};
