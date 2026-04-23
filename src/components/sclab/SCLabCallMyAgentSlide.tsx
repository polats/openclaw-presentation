import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { SCLAB, SCLAB_FONTS } from './theme';
import { SlideFrame, SCLabTitle, Rule } from './SCLabFrame';
import { getAssetSrc } from './getAssetSrc';

const SCREENS = [
  { file: 'call-my-agent/call-my-agent-ss1.png', label: 'HOME' },
  { file: 'call-my-agent/call-my-agent-ss3.png', label: 'CALL' },
  { file: 'call-my-agent/call-my-agent-ss4.png', label: 'INBOX' },
];

export type SCLabCallMyAgentSlideProps = {
  index: number;
  total: number;
};

export const SCLabCallMyAgentSlide: React.FC<SCLabCallMyAgentSlideProps> = ({ index, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const coverOpacity = interpolate(frame, [6, 22], [0, 1], { extrapolateRight: 'clamp' });
  const coverScale = spring({
    fps,
    frame: frame - 4,
    config: { damping: 14, stiffness: 100 },
    from: 0.96,
    to: 1,
  });

  return (
    <AbsoluteFill>
      <SlideFrame eyebrow="PROTOTYPE · CALL MY AGENT" index={index} total={total}>
        <SCLabTitle italic size={5.5}>Call My Agent</SCLabTitle>
        <Rule width={120} />

        <div style={{ display: 'flex', gap: 28, flex: 1, minHeight: 0 }}>
          {/* Left: cover */}
          <div
            style={{
              flex: '0 0 55%',
              minWidth: 0,
              border: `1px solid ${SCLAB.ink['500']}`,
              backgroundColor: SCLAB.ink['200'],
              padding: 10,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: coverOpacity,
              transform: `scale(${coverScale})`,
              transformOrigin: 'left center',
            }}
          >
            <img
              src={getAssetSrc('call-my-agent/call-my-agent-cover.jpg')}
              alt="Call My Agent cover"
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
                top: 14,
                left: 14,
                padding: '6px 10px',
                backgroundColor: SCLAB.signal['500'],
                color: SCLAB.ink['100'],
                fontFamily: SCLAB_FONTS.mono,
                fontSize: '0.78rem',
                letterSpacing: '0.25em',
              }}
            >
              COVER · 001
            </div>
          </div>

          {/* Right: four phone screenshots in a row */}
          <div style={{ flex: 1, display: 'flex', gap: 16, minHeight: 0 }}>
            {SCREENS.map((s, i) => {
              const iFrame = frame - (14 + i * 8);
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
                  key={s.file}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: `1px solid ${SCLAB.ink['500']}`,
                    backgroundColor: SCLAB.ink['200'],
                    padding: 6,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity,
                    transform: `scale(${scale})`,
                  }}
                >
                  <img
                    src={getAssetSrc(s.file)}
                    alt={s.label}
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
                    {s.label}
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
