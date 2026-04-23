import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { SCLAB, SCLAB_FONTS } from './theme';
import { Eyebrow, OnAirChip, StationTag, SlideIndex } from './SCLabFrame';

export type SCLabTitleSlideProps = {
  titleText: string;
  subtitleText: string;
  index?: number;
  total?: number;
};

export const SCLabTitleSlide: React.FC<SCLabTitleSlideProps> = ({
  titleText,
  subtitleText,
  index = 1,
  total = 8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = spring({ fps, frame, config: { damping: 18, stiffness: 110 }, from: 40, to: 0 });
  const titleOpacity = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: 'clamp' });
  const ruleScale = interpolate(frame, [14, 40], [0, 1], { extrapolateRight: 'clamp' });
  const subOpacity = interpolate(frame, [26, 44], [0, 1], { extrapolateRight: 'clamp' });
  const framePulse = 0.55 + Math.sin(frame * 0.14) * 0.35;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '72px 96px 96px',
          color: SCLAB.bone['900'],
          fontFamily: SCLAB_FONTS.sans,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Eyebrow>LAB REPORT · SUPERCELL AI LAB</Eyebrow>
        <OnAirChip />

        {/* Centered hero */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            maxWidth: 1400,
          }}
        >
          <div
            style={{
              fontFamily: SCLAB_FONTS.mono,
              fontSize: '1rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: SCLAB.bone['500'],
              marginBottom: 28,
              opacity: titleOpacity,
            }}
          >
            // progress report · prototypes in flight
          </div>

          <h1
            style={{
              fontFamily: SCLAB_FONTS.serif,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: '10rem',
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              color: SCLAB.bone['900'],
              margin: 0,
              transform: `translateY(${titleY}px)`,
              opacity: titleOpacity,
            }}
          >
            {titleText}
          </h1>

          <div
            style={{
              height: 2,
              backgroundColor: SCLAB.signal['500'],
              width: `${ruleScale * 320}px`,
              margin: '36px 0 32px',
              boxShadow: `0 0 ${framePulse * 18}px ${SCLAB.signal['500']}`,
            }}
          />

          <div
            style={{
              fontFamily: SCLAB_FONTS.sans,
              fontSize: '2.2rem',
              fontWeight: 400,
              color: SCLAB.bone['700'],
              letterSpacing: '0.01em',
              maxWidth: 1100,
              opacity: subOpacity,
              lineHeight: 1.3,
            }}
          >
            {subtitleText}
          </div>

          <div
            style={{
              marginTop: 56,
              display: 'flex',
              gap: 40,
              fontFamily: SCLAB_FONTS.mono,
              fontSize: '0.95rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: SCLAB.bone['500'],
              opacity: subOpacity,
            }}
          >
            <span>[ STATUS: BUILDING ]</span>
            <span>[ PROTOTYPES: 3 ]</span>
            <span style={{ color: SCLAB.phosphor['500'] }}>[ ◉ LIVE ]</span>
          </div>
        </div>

        <SlideIndex current={index} total={total} />
        <StationTag />
      </div>
    </AbsoluteFill>
  );
};
