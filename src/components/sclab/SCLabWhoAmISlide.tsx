import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { SCLAB, SCLAB_FONTS } from './theme';
import { SlideFrame, SCLabTitle, Rule } from './SCLabFrame';
import { getAssetSrc } from './getAssetSrc';

export type SCLabWhoAmISlideProps = {
  index?: number;
  total?: number;
};

const BULLETS = [
  { k: 'NAME', v: 'Paul (@polats)' },
  { k: 'LOC', v: 'Toronto, CA' },
  { k: 'STATUS', v: 'First time in Helsinki' },
  { k: 'PRIOR', v: 'Anino → Gameloft → Altitude → OP Games → Cosmic Labs' },
];

const SIDE_IMAGES = [
  { file: 'supercell/runrun.webp', alt: 'RunRun' },
  { file: 'supercell/arcadia.png', alt: 'Arcadia' },
];

export const SCLabWhoAmISlide: React.FC<SCLabWhoAmISlideProps> = ({ index = 2, total = 8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const photoScale = spring({ fps, frame: frame - 6, config: { damping: 14, stiffness: 110 }, from: 0.94, to: 1 });
  const photoOpacity = interpolate(frame, [6, 22], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <SlideFrame eyebrow="INTRO · WHOAMI" index={index} total={total}>
        <SCLabTitle italic size={6.5}>whoami</SCLabTitle>
        <Rule width={120} />

        <div style={{ display: 'flex', gap: 48, flex: 1, minHeight: 0 }}>
          {/* Left: operator card */}
          <div
            style={{
              width: 360,
              border: `1px solid ${SCLAB.ink['500']}`,
              backgroundColor: SCLAB.ink['200'],
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              opacity: photoOpacity,
              transform: `scale(${photoScale})`,
            }}
          >
            <div
              style={{
                fontFamily: SCLAB_FONTS.mono,
                fontSize: '0.85rem',
                letterSpacing: '0.3em',
                color: SCLAB.bone['500'],
                textTransform: 'uppercase',
              }}
            >
              [ OPERATOR · PAUL ]
            </div>
            <img
              src={getAssetSrc('supercell/paulgadi.webp')}
              alt="Paul Gadi"
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                objectFit: 'cover',
                border: `2px solid ${SCLAB.signal['500']}`,
                filter: 'grayscale(0.4) contrast(1.05)',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {BULLETS.map((b, i) => {
                const bFrame = frame - (i * 6 + 14);
                const opacity = interpolate(bFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
                return (
                  <div key={b.k} style={{ display: 'flex', gap: 14, opacity }}>
                    <span
                      style={{
                        fontFamily: SCLAB_FONTS.mono,
                        fontSize: '0.85rem',
                        color: SCLAB.bone['500'],
                        letterSpacing: '0.2em',
                        width: 70,
                        flexShrink: 0,
                      }}
                    >
                      {b.k}
                    </span>
                    <span
                      style={{
                        fontFamily: SCLAB_FONTS.sans,
                        fontSize: '1rem',
                        color: SCLAB.bone['900'],
                      }}
                    >
                      {b.v}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: past-signal imagery */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18, minHeight: 0 }}>
            <div
              style={{
                fontFamily: SCLAB_FONTS.mono,
                fontSize: '0.9rem',
                color: SCLAB.bone['500'],
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
              }}
            >
              [ PAST SIGNALS ]
            </div>
            <div style={{ display: 'flex', gap: 18, flex: 1, minHeight: 0 }}>
              {SIDE_IMAGES.map((img, i) => {
                const opacity = interpolate(frame, [16 + i * 10, 30 + i * 10], [0, 1], { extrapolateRight: 'clamp' });
                return (
                  <div
                    key={img.file}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      border: `1px solid ${SCLAB.ink['500']}`,
                      position: 'relative',
                      overflow: 'hidden',
                      opacity,
                    }}
                  >
                    <img
                      src={getAssetSrc(img.file)}
                      alt={img.alt}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: i === 0 ? 'left center' : 'center',
                        filter: 'grayscale(0.35) contrast(1.05)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 12,
                        left: 14,
                        fontFamily: SCLAB_FONTS.mono,
                        fontSize: '0.8rem',
                        color: SCLAB.bone['900'],
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        textShadow: '0 0 8px rgba(0,0,0,0.9)',
                      }}
                    >
                      {img.alt}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SlideFrame>
    </AbsoluteFill>
  );
};
