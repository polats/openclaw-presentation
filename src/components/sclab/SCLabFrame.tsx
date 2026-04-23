import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SCLAB, SCLAB_FONTS } from './theme';

// Bracketed mono eyebrow label e.g. [ TRANSMISSION 003 ]
export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; delay?: number }> = ({
  children,
  color = SCLAB.signal['500'],
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        fontFamily: SCLAB_FONTS.mono,
        fontSize: '1.1rem',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color,
        opacity,
        position: 'relative',
      }}
    >
      [ {children} ]
    </div>
  );
};

// "LIVE" chip — tiny pulsing indicator, always top-right.
export const OnAirChip: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.55 + Math.sin(frame * 0.18) * 0.35;
  return (
    <div
      style={{
        position: 'absolute',
        top: 48,
        right: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: SCLAB_FONTS.mono,
        fontSize: '0.95rem',
        letterSpacing: '0.25em',
        color: SCLAB.bone['900'],
        textTransform: 'uppercase',
        padding: '8px 14px',
        border: `1px solid ${SCLAB.signal['500']}`,
        backgroundColor: SCLAB.signal['050'],
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          backgroundColor: SCLAB.signal['500'],
          boxShadow: `0 0 ${6 + pulse * 14}px ${SCLAB.signal['500']}`,
          opacity: pulse,
        }}
      />
      LIVE
    </div>
  );
};

// Slide index label — bottom-left, e.g. "003 / 008"
export const SlideIndex: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div
    style={{
      position: 'absolute',
      bottom: 40,
      left: 56,
      fontFamily: SCLAB_FONTS.mono,
      fontSize: '0.95rem',
      color: SCLAB.bone['500'],
      letterSpacing: '0.25em',
    }}
  >
    {String(current).padStart(3, '0')} / {String(total).padStart(3, '0')}
  </div>
);

// Fixed station tag bottom-right
export const StationTag: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      bottom: 40,
      right: 56,
      fontFamily: SCLAB_FONTS.mono,
      fontSize: '0.95rem',
      color: SCLAB.bone['500'],
      letterSpacing: '0.25em',
    }}
  >
    SUPERCELL AI LAB · HELSINKI
  </div>
);

// Title with serif display + thin orange rule underneath.
export const SCLabTitle: React.FC<{
  children: React.ReactNode;
  italic?: boolean;
  size?: number;
}> = ({ children, italic = false, size = 7.5 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const y = spring({ fps, frame, config: { damping: 14, stiffness: 120 }, from: 24, to: 0 });
  const opacity = interpolate(frame, [2, 18], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <h1
      style={{
        fontFamily: SCLAB_FONTS.serif,
        fontStyle: italic ? 'italic' : 'normal',
        fontWeight: 400,
        fontSize: `${size}rem`,
        lineHeight: 1,
        letterSpacing: '-0.01em',
        color: SCLAB.bone['900'],
        margin: 0,
        transform: `translateY(${y}px)`,
        opacity,
      }}
    >
      {children}
    </h1>
  );
};

// Thin horizontal divider rule.
export const Rule: React.FC<{ color?: string; width?: string | number }> = ({
  color = SCLAB.signal['500'],
  width = 80,
}) => (
  <div style={{ width, height: 2, backgroundColor: color, margin: '24px 0' }} />
);

// Slide chrome — padding, eyebrow, index, station tag. Content passed as children.
export const SlideFrame: React.FC<{
  eyebrow: string;
  index: number;
  total: number;
  children: React.ReactNode;
  onAir?: boolean;
  compact?: boolean;
}> = ({ eyebrow, index, total, children, onAir = true, compact = false }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      padding: compact ? '40px 64px 56px' : '72px 96px 96px',
      color: SCLAB.bone['900'],
      fontFamily: SCLAB_FONTS.sans,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Eyebrow>{eyebrow}</Eyebrow>
    {onAir && <OnAirChip />}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, marginTop: compact ? 10 : 16 }}>
      {children}
    </div>
    <SlideIndex current={index} total={total} />
    <StationTag />
  </div>
);
