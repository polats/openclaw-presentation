import React, { useEffect, useRef } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { SCLAB, SCLAB_FONTS } from './theme';
import { SlideFrame, SCLabTitle, Rule } from './SCLabFrame';
import { getAssetSrc } from './getAssetSrc';

export type SCLabSoulcatsSlideProps = {
  index: number;
  total: number;
};

export const SCLabSoulcatsSlide: React.FC<SCLabSoulcatsSlideProps> = ({ index, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  const contentOpacity = interpolate(frame, [10, 26], [0, 1], { extrapolateRight: 'clamp' });
  const contentScale = spring({ fps, frame: frame - 8, config: { damping: 14, stiffness: 100 }, from: 0.96, to: 1 });
  const subOpacity = interpolate(frame, [26, 42], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <SlideFrame eyebrow="PROTOTYPE · SOULCATS" index={index} total={total}>
        <SCLabTitle italic size={5}>soulcats.xyz</SCLabTitle>
        <Rule width={120} />

        <div
          style={{
            display: 'flex',
            gap: 24,
            flex: 1,
            minHeight: 0,
            opacity: contentOpacity,
            transform: `scale(${contentScale})`,
          }}
        >
          {[
            { kind: 'img', src: 'supercell/sc.png', label: 'UI · SITE' },
            { kind: 'vid', src: 'supercell/soulcats.mp4', label: 'LIVE · GAMEPLAY' },
          ].map((m) => (
            <div
              key={m.src}
              style={{
                flex: 1,
                minWidth: 0,
                border: `1px solid ${SCLAB.ink['500']}`,
                backgroundColor: SCLAB.ink['200'],
                padding: 10,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {m.kind === 'img' ? (
                <img
                  src={getAssetSrc(m.src)}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'contrast(1.05)' }}
                />
              ) : (
                <video
                  ref={videoRef}
                  src={getAssetSrc(m.src)}
                  loop
                  muted
                  autoPlay
                  playsInline
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'contrast(1.05)' }}
                />
              )}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  padding: '5px 10px',
                  backgroundColor: SCLAB.signal['500'],
                  color: SCLAB.ink['100'],
                  fontFamily: SCLAB_FONTS.mono,
                  fontSize: '0.78rem',
                  letterSpacing: '0.25em',
                }}
              >
                {m.label}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 18,
            fontFamily: SCLAB_FONTS.sans,
            fontSize: '1.5rem',
            color: SCLAB.bone['700'],
            textAlign: 'center',
            opacity: subOpacity,
          }}
        >
          agent identity + agentic multiplayer ·{' '}
          <a
            href="https://soulcats.xyz"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: SCLAB.signal['500'],
              textDecoration: 'underline',
              textUnderlineOffset: '5px',
              fontFamily: SCLAB_FONTS.mono,
              fontSize: '1.2rem',
              letterSpacing: '0.1em',
            }}
          >
            soulcats.xyz
          </a>
        </div>
      </SlideFrame>
    </AbsoluteFill>
  );
};
