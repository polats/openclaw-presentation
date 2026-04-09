import React, { useRef, useEffect } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill, staticFile } from 'remotion';

export type SoulcatsSlideProps = {
  primaryColor: string;
};

const getAssetSrc = (file: string) => {
  if (typeof window !== 'undefined' && (window as any).remotion_isStudio) {
    return staticFile(file);
  }
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${basePath}/${file}`;
};

export const SoulcatsSlide: React.FC<SoulcatsSlideProps> = ({ primaryColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const videoRef = useRef<HTMLVideoElement>(null);

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = spring({
    fps,
    frame,
    config: { damping: 10, stiffness: 100 },
    from: -30,
    to: 0,
  });

  const contentOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' });
  const contentScale = spring({
    fps,
    frame: frame - 10,
    config: { damping: 14, stiffness: 100 },
    from: 0.9,
    to: 1,
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
  }, []);

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
        soulcats.xyz
      </h1>

      {/* Image + Video side by side */}
      <div style={{
        display: 'flex',
        gap: '24px',
        flex: 1,
        position: 'relative',
        opacity: contentOpacity,
        transform: `scale(${contentScale})`,
        minHeight: 0,
      }}>
        {/* Screenshot */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
          <img
            src={getAssetSrc('supercell/sc.png')}
            alt="Soulcats"
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

        {/* Video */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
          <video
            ref={videoRef}
            src={getAssetSrc('supercell/soulcats.mp4')}
            loop
            muted
            autoPlay
            playsInline
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
      </div>

      {/* Subtitle */}
      <p style={{
        fontSize: '1.8rem',
        fontWeight: 400,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: '12px',
        opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: 'clamp' }),
        position: 'relative',
        textAlign: 'center',
      }}>
        Agent identity + agentic multiplayer on{' '}
        <a href="https://soulcats.xyz" target="_blank" rel="noopener noreferrer" style={{ color: primaryColor, textDecoration: 'underline', textUnderlineOffset: '6px', fontWeight: 600 }}>
          soulcats.xyz
        </a>
      </p>
    </AbsoluteFill>
  );
};
