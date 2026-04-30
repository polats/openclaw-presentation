import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { SCLAB, SCLAB_FONTS } from './theme';
import { SlideFrame, SCLabTitle, Rule } from './SCLabFrame';
import { getAssetSrc } from './getAssetSrc';

const PANELS = [
  { file: '0429/map.png', label: 'MAP' },
  { file: '0429/view.png', label: 'VIEW' },
];

export type SCLabGameInterfaceSlideProps = {
  index: number;
  total: number;
};

export const SCLabGameInterfaceSlide: React.FC<SCLabGameInterfaceSlideProps> = ({
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <SlideFrame eyebrow="INTERFACE · CLIENT" index={index} total={total}>
        <SCLabTitle italic size={6}>game interface</SCLabTitle>
        <Rule width={120} />

        <div
          style={{
            display: 'flex',
            gap: 48,
            flex: 1,
            minHeight: 0,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 16,
          }}
        >
          {PANELS.map((p, i) => {
            const iFrame = frame - (10 + i * 12);
            const opacity = interpolate(iFrame, [0, 16], [0, 1], { extrapolateRight: 'clamp' });
            const scale = spring({
              fps,
              frame: iFrame,
              config: { damping: 14, stiffness: 110 },
              from: 0.94,
              to: 1,
            });
            return (
              <div
                key={p.file}
                style={{
                  flex: '0 0 auto',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity,
                  transform: `scale(${scale})`,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    height: '100%',
                    border: `1px solid ${SCLAB.ink['500']}`,
                    backgroundColor: SCLAB.ink['200'],
                    padding: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={getAssetSrc(p.file)}
                    alt={p.label}
                    style={{
                      height: '100%',
                      width: 'auto',
                      objectFit: 'contain',
                      filter: 'contrast(1.05)',
                      display: 'block',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      padding: '5px 10px',
                      backgroundColor: SCLAB.signal['500'],
                      color: SCLAB.ink['100'],
                      fontFamily: SCLAB_FONTS.mono,
                      fontSize: '0.78rem',
                      letterSpacing: '0.25em',
                    }}
                  >
                    {p.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SlideFrame>
    </AbsoluteFill>
  );
};
