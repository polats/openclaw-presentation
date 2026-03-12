import React, { useRef, useEffect } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill, staticFile } from 'remotion';

export type VideoSlideProps = {
  title: string;
  subtitle?: string | React.ReactNode;
  videoFile: string;
  videoDurationInSeconds: number;
  primaryColor: string;
};

const getVideoSrc = (videoFile: string) => {
  if (typeof window !== 'undefined' && (window as any).remotion_isStudio) {
    return staticFile(videoFile);
  }
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${basePath}/${videoFile}`;
};

export const VideoSlide: React.FC<VideoSlideProps> = ({
  title,
  subtitle,
  videoFile,
  videoDurationInSeconds,
  primaryColor,
}) => {
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

  const videoScale = spring({
    fps,
    frame: frame - 10,
    config: { damping: 14, stiffness: 100 },
    from: 0.9,
    to: 1,
  });
  const videoOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' });
  const subtitleOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: 'clamp' });

  // Keep video playing and looped
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
        padding: '50px 100px',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
        alignItems: 'center',
      }}
    >
      {/* Semi-transparent backdrop */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(15, 16, 20, 0.8)',
        backdropFilter: 'blur(8px)',
      }} />

      {/* Title */}
      <h1
        style={{
          fontSize: '3.5rem',
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

      {/* Video */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          opacity: videoOpacity,
          transform: `scale(${videoScale})`,
          maxHeight: '75%',
        }}
      >
        <video
          ref={videoRef}
          src={getVideoSrc(videoFile)}
          loop
          muted
          autoPlay
          playsInline
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '12px',
            border: `1px solid rgba(255,255,255,0.1)`,
            boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${primaryColor}20`,
          }}
        />
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontSize: '2.2rem',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.8)',
            marginTop: '12px',
            opacity: subtitleOpacity,
            position: 'relative',
            textAlign: 'center',
          }}
        >
          {subtitle}
        </p>
      )}
    </AbsoluteFill>
  );
};
