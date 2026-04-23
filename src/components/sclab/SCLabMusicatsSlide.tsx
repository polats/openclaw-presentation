import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { SCLAB, SCLAB_FONTS } from './theme';
import { SlideFrame, SCLabTitle, Rule } from './SCLabFrame';
import { getAssetSrc } from './getAssetSrc';

const IMAGES = [
  { file: 'supercell/musicats1.png', label: 'STEM · 001' },
  { file: 'supercell/musicats2.png', label: 'STEM · 002' },
  { file: 'supercell/musicats3.png', label: 'STEM · 003' },
];

export type SCLabMusicatsSlideProps = {
  index: number;
  total: number;
};

export const SCLabMusicatsSlide: React.FC<SCLabMusicatsSlideProps> = ({ index, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const subOpacity = interpolate(frame, [32, 48], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <SlideFrame eyebrow="PROTOTYPE · MUSICATS" index={index} total={total}>
        <SCLabTitle italic size={4.4}>musicats.soulcats.space</SCLabTitle>
        <Rule width={120} />

        <div style={{ display: 'flex', gap: 22, flex: 1, minHeight: 0 }}>
          {IMAGES.map((img, i) => {
            const iFrame = frame - (10 + i * 10);
            const opacity = interpolate(iFrame, [0, 16], [0, 1], { extrapolateRight: 'clamp' });
            const scale = spring({ fps, frame: iFrame, config: { damping: 14, stiffness: 100 }, from: 0.94, to: 1 });
            return (
              <div
                key={img.file}
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
                  opacity,
                  transform: `scale(${scale})`,
                }}
              >
                <img
                  src={getAssetSrc(img.file)}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    filter: 'contrast(1.05)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    padding: '5px 10px',
                    backgroundColor: SCLAB.phosphor['500'],
                    color: SCLAB.ink['100'],
                    fontFamily: SCLAB_FONTS.mono,
                    fontSize: '0.78rem',
                    letterSpacing: '0.25em',
                  }}
                >
                  {img.label}
                </div>
              </div>
            );
          })}
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
          strudel · UGC · music skills ·{' '}
          <a
            href="https://musicats.soulcats.space"
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
            musicats.soulcats.space
          </a>
        </div>
      </SlideFrame>
    </AbsoluteFill>
  );
};
