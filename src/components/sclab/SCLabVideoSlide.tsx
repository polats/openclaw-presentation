import React, { useEffect, useRef } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { SCLAB, SCLAB_FONTS } from './theme';
import { SlideFrame, SCLabTitle, Rule } from './SCLabFrame';
import { getAssetSrc } from './getAssetSrc';
import { VideoScrubber } from './VideoScrubber';

export type SCLabVideoSlideProps = {
  eyebrow: string;
  title: string;
  titleItalic?: boolean;
  subtitle?: React.ReactNode;
  videoFile: string;
  videoPlaybackRate?: number;
  index: number;
  total: number;
};

export const SCLabVideoSlide: React.FC<SCLabVideoSlideProps> = ({
  eyebrow,
  title,
  titleItalic,
  subtitle,
  videoFile,
  videoPlaybackRate = 1,
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = videoPlaybackRate;
    v.play().catch(() => {});
  }, [videoPlaybackRate]);

  const vidScale = spring({ fps, frame: frame - 8, config: { damping: 14, stiffness: 100 }, from: 0.96, to: 1 });
  const vidOpacity = interpolate(frame, [8, 22], [0, 1], { extrapolateRight: 'clamp' });
  const subOpacity = interpolate(frame, [24, 38], [0, 1], { extrapolateRight: 'clamp' });
  const recPulse = 0.5 + Math.sin(frame * 0.22) * 0.5;

  return (
    <AbsoluteFill>
      <SlideFrame eyebrow={eyebrow} index={index} total={total}>
        <SCLabTitle italic={titleItalic} size={5}>{title}</SCLabTitle>
        <Rule width={120} />

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'center',
            minHeight: 0,
            opacity: vidOpacity,
            transform: `scale(${vidScale})`,
            gap: 10,
          }}
        >
          <div
            style={{
              position: 'relative',
              flex: 1,
              minHeight: 0,
              border: `1px solid ${SCLAB.ink['500']}`,
              backgroundColor: SCLAB.ink['000'],
              padding: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <video
              ref={videoRef}
              src={getAssetSrc(videoFile)}
              loop
              muted
              autoPlay
              playsInline
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
                top: 20,
                right: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 12px',
                backgroundColor: 'rgba(11,11,12,0.75)',
                border: `1px solid ${SCLAB.signal['500']}`,
                fontFamily: SCLAB_FONTS.mono,
                fontSize: '0.85rem',
                color: SCLAB.bone['900'],
                letterSpacing: '0.25em',
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: SCLAB.signal['500'],
                  opacity: recPulse,
                }}
              />
              LIVE
            </div>
          </div>
          <VideoScrubber videoRef={videoRef} />
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
