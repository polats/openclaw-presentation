import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill, staticFile } from 'remotion';

export type ScreenshotSlideProps = {
  title: string;
  subtitle?: string | React.ReactNode;
  highlightText?: string;
  footnote?: string;
  note?: string;
  imageSrc?: string;
  imageFile?: string;
  primaryColor: string;
  compact?: boolean;
};

const getImageSrc = (imageFile?: string) => {
  if (!imageFile) return '';
  if (typeof window !== 'undefined' && (window as any).remotion_isStudio) {
    return staticFile(imageFile);
  }
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${basePath}/${imageFile}`;
};

export const ScreenshotSlide: React.FC<ScreenshotSlideProps> = ({
  title,
  subtitle,
  highlightText,
  footnote,
  note,
  imageSrc,
  imageFile,
  primaryColor,
  compact = false,
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

  const imageScale = spring({
    fps,
    frame: frame - 10,
    config: { damping: 14, stiffness: 100 },
    from: 0.9,
    to: 1,
  });
  const imageOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' });

  const subtitleOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: 'clamp' });
  const footnoteOpacity = interpolate(frame, [30, 45], [0, 1], { extrapolateRight: 'clamp' });

  const resolvedSrc = imageSrc || getImageSrc(imageFile);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        padding: compact ? '30px 60px' : '50px 100px',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
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
          fontSize: compact ? '2.5rem' : '3.5rem',
          fontWeight: 800,
          fontFamily: '"Pixelify Sans", Inter, sans-serif',
          textTransform: 'uppercase',
          borderBottom: `4px solid ${primaryColor}`,
          paddingBottom: '12px',
          marginBottom: compact ? '8px' : '16px',
          width: 'fit-content',
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          position: 'relative',
        }}
      >
        {title}
      </h1>

      {/* Screenshot */}
      {resolvedSrc && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            opacity: imageOpacity,
            transform: `scale(${imageScale})`,
            minHeight: 0,
          }}
        >
          {/* Use native img for GIF animation support */}
          <img
            src={resolvedSrc}
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
      )}

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
          {highlightText && (
            <>
              {' '}
              <a
                href={highlightText.startsWith('http') ? highlightText : `https://${highlightText}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: primaryColor,
                  textDecoration: 'underline',
                  textUnderlineOffset: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {highlightText}
              </a>
            </>
          )}
        </p>
      )}

      {/* Footnote */}
      {footnote && (
        <p
          style={{
            fontSize: '1.8rem',
            fontWeight: 500,
            fontFamily: 'monospace',
            color: primaryColor,
            marginTop: '6px',
            opacity: footnoteOpacity,
            position: 'relative',
          }}
        >
          {footnote}
        </p>
      )}

      {/* Note */}
      {note && (
        <p
          style={{
            fontSize: '1.5rem',
            fontWeight: 400,
            fontStyle: 'italic',
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: '4px',
            opacity: footnoteOpacity,
            position: 'relative',
          }}
        >
          {note}
        </p>
      )}
    </AbsoluteFill>
  );
};
