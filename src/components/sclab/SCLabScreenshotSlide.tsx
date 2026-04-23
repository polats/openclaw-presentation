import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { SCLAB, SCLAB_FONTS } from './theme';
import { SlideFrame, SCLabTitle, Rule } from './SCLabFrame';
import { getAssetSrc } from './getAssetSrc';

export type SCLabScreenshotSlideProps = {
  eyebrow: string;
  title: string;
  titleItalic?: boolean;
  subtitle?: React.ReactNode;
  imageFile: string;
  index: number;
  total: number;
};

export const SCLabScreenshotSlide: React.FC<SCLabScreenshotSlideProps> = ({
  eyebrow,
  title,
  titleItalic,
  subtitle,
  imageFile,
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const imgScale = spring({ fps, frame: frame - 8, config: { damping: 14, stiffness: 100 }, from: 0.96, to: 1 });
  const imgOpacity = interpolate(frame, [8, 22], [0, 1], { extrapolateRight: 'clamp' });
  const subOpacity = interpolate(frame, [24, 38], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <SlideFrame eyebrow={eyebrow} index={index} total={total}>
        <SCLabTitle italic={titleItalic} size={5.2}>{title}</SCLabTitle>
        <Rule width={120} />

        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 0,
            opacity: imgOpacity,
            transform: `scale(${imgScale})`,
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '100%',
              maxHeight: '100%',
              border: `1px solid ${SCLAB.ink['500']}`,
              backgroundColor: SCLAB.ink['200'],
              padding: 10,
            }}
          >
            <img
              src={getAssetSrc(imageFile)}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                display: 'block',
                objectFit: 'contain',
                filter: 'contrast(1.05)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: -1,
                left: -1,
                padding: '6px 10px',
                fontFamily: SCLAB_FONTS.mono,
                fontSize: '0.8rem',
                color: SCLAB.ink['100'],
                backgroundColor: SCLAB.signal['500'],
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
              }}
            >
              STILL · INCOMING
            </div>
          </div>
        </div>

        {subtitle && (
          <div
            style={{
              marginTop: 20,
              fontFamily: SCLAB_FONTS.sans,
              fontSize: '1.6rem',
              fontWeight: 400,
              color: SCLAB.bone['700'],
              textAlign: 'center',
              opacity: subOpacity,
            }}
          >
            {subtitle}
          </div>
        )}
      </SlideFrame>
    </AbsoluteFill>
  );
};
