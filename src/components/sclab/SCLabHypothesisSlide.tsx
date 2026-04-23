import React, { useEffect, useRef } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { SCLAB, SCLAB_FONTS } from './theme';
import { SlideFrame, SCLabTitle, Rule } from './SCLabFrame';
import { getAssetSrc } from './getAssetSrc';
import { VideoScrubber } from './VideoScrubber';

const SUB_BULLETS = [
  'Created tutorial scenario: System Breach',
  'Tighter First-time User Experience',
  'Minigame exploration',
];

export type SCLabHypothesisSlideProps = {
  index: number;
  total: number;
};

export const SCLabHypothesisSlide: React.FC<SCLabHypothesisSlideProps> = ({ index, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = 1.5;
    v.play().catch(() => {});
  }, []);

  const mainY = spring({ fps, frame: frame - 6, config: { damping: 16, stiffness: 120 }, from: 20, to: 0 });
  const mainOpacity = interpolate(frame, [6, 24], [0, 1], { extrapolateRight: 'clamp' });

  const mediaScale = spring({ fps, frame: frame - 12, config: { damping: 14, stiffness: 100 }, from: 0.95, to: 1 });
  const imgOpacity = interpolate(frame, [12, 28], [0, 1], { extrapolateRight: 'clamp' });
  const vidOpacity = interpolate(frame, [20, 36], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <SlideFrame eyebrow="HYPOTHESIS · WEEK 3" index={index} total={total}>
        <SCLabTitle italic size={6}>hypothesis</SCLabTitle>
        <Rule width={120} />

        <div style={{ display: 'flex', gap: 48, flex: 1, minHeight: 0 }}>
          {/* Left: main hypothesis + sub-bullets + key art */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0, paddingTop: 8 }}>
            {/* Main bullet — serif pull quote */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 20,
                transform: `translateY(${mainY}px)`,
                opacity: mainOpacity,
              }}
            >
              <div
                style={{
                  width: 4,
                  alignSelf: 'stretch',
                  backgroundColor: SCLAB.signal['500'],
                  flexShrink: 0,
                  boxShadow: `0 0 14px ${SCLAB.signal['500']}`,
                }}
              />
              <div
                style={{
                  fontFamily: SCLAB_FONTS.serif,
                  fontStyle: 'italic',
                  fontSize: '2.6rem',
                  lineHeight: 1.2,
                  color: SCLAB.bone['900'],
                  letterSpacing: '-0.005em',
                }}
              >
                Improving onboarding and structured gameplay will increase engagement.
              </div>
            </div>

            {/* Sub-bullets header */}
            <div
              style={{
                fontFamily: SCLAB_FONTS.mono,
                fontSize: '0.85rem',
                letterSpacing: '0.3em',
                color: SCLAB.bone['500'],
                textTransform: 'uppercase',
                opacity: interpolate(frame, [22, 36], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              [ TEST VECTORS ]
            </div>

            {/* Sub-bullets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {SUB_BULLETS.map((s, i) => {
                const sFrame = frame - (28 + i * 10);
                const x = spring({ fps, frame: sFrame, config: { damping: 16, stiffness: 140 }, from: 30, to: 0 });
                const opacity = interpolate(sFrame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 18,
                      transform: `translateX(${x}px)`,
                      opacity,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: SCLAB_FONTS.mono,
                        fontSize: '0.9rem',
                        color: SCLAB.signal['500'],
                        letterSpacing: '0.22em',
                        width: 48,
                        flexShrink: 0,
                      }}
                    >
                      {String(i + 1).padStart(2, '0')} /
                    </span>
                    <span
                      style={{
                        fontFamily: SCLAB_FONTS.sans,
                        fontSize: '1.55rem',
                        color: SCLAB.bone['700'],
                        lineHeight: 1.35,
                      }}
                    >
                      {s}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Key art — below sub-bullets */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                marginTop: 8,
                border: `1px solid ${SCLAB.ink['500']}`,
                backgroundColor: SCLAB.ink['200'],
                padding: 8,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: imgOpacity,
                transform: `scale(${mediaScale})`,
                transformOrigin: 'center center',
              }}
            >
              <img
                src={getAssetSrc('call-my-agent/system-breach.jpg')}
                alt="System Breach"
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
                  top: 10,
                  left: 10,
                  padding: '5px 9px',
                  backgroundColor: SCLAB.signal['500'],
                  color: SCLAB.ink['100'],
                  fontFamily: SCLAB_FONTS.mono,
                  fontSize: '0.75rem',
                  letterSpacing: '0.25em',
                }}
              >
                STILL · KEY ART
              </div>
            </div>
          </div>

          {/* Right: video full height */}
          <div
            style={{
              flex: '0 0 42%',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              opacity: vidOpacity,
              transform: `scale(${mediaScale})`,
              transformOrigin: 'right center',
            }}
          >
            <div
              style={{
                flex: 1,
                minHeight: 0,
                border: `1px solid ${SCLAB.ink['500']}`,
                backgroundColor: SCLAB.ink['000'],
                padding: 8,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <video
                ref={videoRef}
                src={getAssetSrc('videos/SystemBreach.mp4')}
                loop
                muted
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'contrast(1.05)',
                  display: 'block',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  padding: '6px 10px',
                  backgroundColor: 'rgba(11,11,12,0.78)',
                  border: `1px solid ${SCLAB.signal['500']}`,
                  color: SCLAB.bone['900'],
                  fontFamily: SCLAB_FONTS.mono,
                  fontSize: '0.8rem',
                  letterSpacing: '0.25em',
                }}
              >
                ◉ CLIP · SYSTEM BREACH
              </div>
            </div>
            <VideoScrubber videoRef={videoRef} />
          </div>
        </div>
      </SlideFrame>
    </AbsoluteFill>
  );
};
