import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';

export type DiagramSlideProps = {
  title: string;
  primaryColor: string;
};

export const DiagramSlide: React.FC<DiagramSlideProps> = ({ title, primaryColor }) => {
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

  const sections = [
    {
      icon: '🧠',
      label: 'LLM with Computer Use',
      description: 'AI that can see, click, and code',
      delay: 15,
    },
    {
      icon: '💓',
      label: 'Heartbeat / CRON',
      description: 'Runs autonomously on a schedule',
      delay: 30,
    },
    {
      icon: '💬',
      label: 'Reachable on a Messaging Channel',
      description: 'Chat, Discord, Slack, or any API',
      delay: 45,
    },
  ];

  // Animate the central circle
  const circleScale = spring({
    fps,
    frame: frame - 10,
    config: { damping: 12, stiffness: 80 },
    from: 0,
    to: 1,
  });

  // Pulsing glow on the center
  const pulse = frame > 60 ? 0.5 + Math.sin((frame - 60) * 0.06) * 0.5 : 0;

  // lineProgress is now per-section, computed inside the map below

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
        backgroundColor: 'rgba(15, 16, 20, 0.85)',
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
          marginBottom: '40px',
          width: 'fit-content',
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          position: 'relative',
        }}
      >
        {title}
      </h1>

      {/* Diagram area */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Center node: Openclaw Bot */}
        <div
          style={{
            position: 'absolute',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            border: `3px solid ${primaryColor}`,
            backgroundColor: 'rgba(186, 255, 0, 0.08)',
            boxShadow: `0 0 ${30 + pulse * 40}px ${primaryColor}${Math.round(40 + pulse * 50).toString(16).padStart(2, '0')}, inset 0 0 30px rgba(186, 255, 0, 0.05)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${circleScale})`,
            zIndex: 2,
          }}
        >
          <span style={{ fontSize: '2.5rem', marginBottom: '4px' }}>🦞</span>
          <span style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            fontFamily: '"Pixelify Sans", Inter, sans-serif',
            color: primaryColor,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Openclaw
          </span>
          <span style={{
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.5)',
            fontWeight: 500,
          }}>
            Bot
          </span>
        </div>

        {/* Three sections arranged around the center */}
        {sections.map((section, i) => {
          const angle = (i * 120 - 90) * (Math.PI / 180); // -90 to start from top
          const radius = 340;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          const sectionScale = spring({
            fps,
            frame: frame - section.delay,
            config: { damping: 12, stiffness: 100 },
            from: 0,
            to: 1,
          });
          const sectionOpacity = interpolate(frame - section.delay, [0, 15], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          // Line appears alongside its card
          const lineProgress = interpolate(frame - section.delay, [0, 20], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <React.Fragment key={i}>
              {/* Connecting line */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 0,
                  height: 0,
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              >
                <svg
                  style={{
                    position: 'absolute',
                    left: '-500px',
                    top: '-500px',
                    width: '1000px',
                    height: '1000px',
                    overflow: 'visible',
                  }}
                >
                  <line
                    x1="500"
                    y1="500"
                    x2={500 + x}
                    y2={500 + y}
                    stroke={primaryColor}
                    strokeWidth="2"
                    strokeOpacity={0.4 * lineProgress}
                    strokeDasharray="8 4"
                    strokeDashoffset={interpolate(lineProgress, [0, 1], [100, 0])}
                  />
                </svg>
              </div>

              {/* Section card */}
              <div
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${x}px - 160px)`,
                  top: `calc(50% + ${y}px - 70px)`,
                  width: '320px',
                  padding: '24px 28px',
                  borderRadius: '16px',
                  border: `1px solid rgba(186, 255, 0, 0.2)`,
                  backgroundColor: 'rgba(186, 255, 0, 0.04)',
                  backdropFilter: 'blur(4px)',
                  transform: `scale(${sectionScale})`,
                  opacity: sectionOpacity,
                  zIndex: 3,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{section.icon}</div>
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  fontFamily: '"Pixelify Sans", Inter, sans-serif',
                  color: primaryColor,
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  letterSpacing: '0.03em',
                }}>
                  {section.label}
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.55)',
                  fontWeight: 400,
                }}>
                  {section.description}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
