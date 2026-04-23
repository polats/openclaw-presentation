import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { SCLAB, SCLAB_FONTS } from './theme';
import { SlideFrame, SCLabTitle, Rule } from './SCLabFrame';
import { getAssetSrc } from './getAssetSrc';

const SUB_BULLETS = [
  'taken from feedback',
  'players want roleplay and escapism',
  'more modalities than phone interface',
];

const FANTASY = [
  { file: 'call-my-agent/fantasy/1.jpg', label: 'SCENE · 01' },
  { file: 'call-my-agent/fantasy/2.jpeg', label: 'SCENE · 02' },
  { file: 'call-my-agent/fantasy/3.jpeg', label: 'SCENE · 03' },
  { file: 'call-my-agent/fantasy/4.jpeg', label: 'SCENE · 04' },
];

export type SCLabNewHypothesisSlideProps = {
  index: number;
  total: number;
};

export const SCLabNewHypothesisSlide: React.FC<SCLabNewHypothesisSlideProps> = ({
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainY = spring({
    fps,
    frame: frame - 6,
    config: { damping: 16, stiffness: 120 },
    from: 24,
    to: 0,
  });
  const mainOpacity = interpolate(frame, [6, 24], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <SlideFrame eyebrow="HYPOTHESIS · REVISED" index={index} total={total}>
        <SCLabTitle italic size={6}>new hypothesis</SCLabTitle>
        <Rule width={120} />

        <div style={{ display: 'flex', gap: 48, flex: 1, minHeight: 0 }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 48,
              minWidth: 0,
              paddingTop: 8,
            }}
          >
          {/* Main bullet — pull quote */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 28,
              transform: `translateY(${mainY}px)`,
              opacity: mainOpacity,
            }}
          >
            <div
              style={{
                width: 6,
                alignSelf: 'stretch',
                backgroundColor: SCLAB.signal['500'],
                flexShrink: 0,
                boxShadow: `0 0 18px ${SCLAB.signal['500']}`,
              }}
            />
            <div
              style={{
                fontFamily: SCLAB_FONTS.serif,
                fontStyle: 'italic',
                fontSize: '3.6rem',
                lineHeight: 1.1,
                color: SCLAB.bone['900'],
                letterSpacing: '-0.01em',
              }}
            >
              Lean into the fantasy.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div
              style={{
                fontFamily: SCLAB_FONTS.mono,
                fontSize: '0.95rem',
                letterSpacing: '0.3em',
                color: SCLAB.bone['500'],
                textTransform: 'uppercase',
                opacity: interpolate(frame, [20, 34], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              [ RATIONALE ]
            </div>

            {SUB_BULLETS.map((s, i) => {
              const sFrame = frame - (26 + i * 10);
              const x = spring({
                fps,
                frame: sFrame,
                config: { damping: 16, stiffness: 140 },
                from: 36,
                to: 0,
              });
              const opacity = interpolate(sFrame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 22,
                    transform: `translateX(${x}px)`,
                    opacity,
                  }}
                >
                  <span
                    style={{
                      fontFamily: SCLAB_FONTS.mono,
                      fontSize: '1rem',
                      color: SCLAB.signal['500'],
                      letterSpacing: '0.22em',
                      width: 56,
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')} /
                  </span>
                  <span
                    style={{
                      fontFamily: SCLAB_FONTS.sans,
                      fontSize: '1.6rem',
                      color: SCLAB.bone['900'],
                      lineHeight: 1.3,
                    }}
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
          </div>

          {/* Right: 2x2 grid of fantasy scene images */}
          <div
            style={{
              flex: '0 0 68%',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: 14,
              minWidth: 0,
              minHeight: 0,
            }}
          >
            {FANTASY.map((img, i) => {
              const iFrame = frame - (16 + i * 8);
              const opacity = interpolate(iFrame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
              const scale = spring({
                fps,
                frame: iFrame,
                config: { damping: 14, stiffness: 110 },
                from: 0.94,
                to: 1,
              });
              return (
                <div
                  key={img.file}
                  style={{
                    border: `1px solid ${SCLAB.ink['500']}`,
                    backgroundColor: SCLAB.ink['200'],
                    padding: 6,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 0,
                    minHeight: 0,
                    opacity,
                    transform: `scale(${scale})`,
                  }}
                >
                  <img
                    src={getAssetSrc(img.file)}
                    alt={img.label}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      filter: 'contrast(1.05)',
                      display: 'block',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      padding: '3px 7px',
                      backgroundColor: 'rgba(11,11,12,0.78)',
                      border: `1px solid ${SCLAB.signal['500']}`,
                      color: SCLAB.bone['900'],
                      fontFamily: SCLAB_FONTS.mono,
                      fontSize: '0.7rem',
                      letterSpacing: '0.25em',
                    }}
                  >
                    {img.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SlideFrame>
    </AbsoluteFill>
  );
};
