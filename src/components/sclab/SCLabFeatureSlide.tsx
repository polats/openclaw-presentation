import React, { useEffect, useRef } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { SCLAB, SCLAB_FONTS } from './theme';
import { SlideFrame, SCLabTitle, Rule } from './SCLabFrame';
import { getAssetSrc } from './getAssetSrc';
import { VideoScrubber } from './VideoScrubber';

export type SCLabFeatureSlideProps = {
  eyebrow: string;
  title: string;
  titleItalic?: boolean;
  features: string[];
  index: number;
  total: number;
  imageFile?: string;
  videoFile?: string;
  videoPlaybackRate?: number;
  mediaLabel?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  imageFlex?: number;
};

export const SCLabFeatureSlide: React.FC<SCLabFeatureSlideProps> = ({
  eyebrow,
  title,
  titleItalic,
  features,
  index,
  total,
  imageFile,
  videoFile,
  videoPlaybackRate = 1,
  mediaLabel,
  header,
  footer,
  imageFlex = 1,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = videoPlaybackRate;
    v.play().catch(() => {});
  }, [videoPlaybackRate]);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const imgScale = spring({ fps, frame: frame - 10, config: { damping: 14, stiffness: 100 }, from: 0.95, to: 1 });
  const imgOpacity = interpolate(frame, [10, 26], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <SlideFrame eyebrow={eyebrow} index={index} total={total}>
        <SCLabTitle italic={titleItalic} size={6}>{title}</SCLabTitle>
        <Rule width={120} />

        <div style={{ display: 'flex', gap: 64, flex: 1, minHeight: 0, alignItems: 'stretch' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 8, minWidth: 0 }}>
            {header && (
              <div
                style={{
                  marginBottom: 16,
                  opacity: interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' }),
                }}
              >
                {header}
              </div>
            )}
            {features.map((f, i) => {
              const fFrame = frame - (i * 10 + 16);
              const x = spring({ fps, frame: fFrame, config: { damping: 16, stiffness: 140 }, from: 40, to: 0 });
              const opacity = interpolate(fFrame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
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
                      letterSpacing: '0.2em',
                      width: 56,
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')} /
                  </span>
                  <span
                    style={{
                      fontFamily: SCLAB_FONTS.sans,
                      fontSize: imageFile ? '1.8rem' : '2.2rem',
                      fontWeight: 400,
                      color: SCLAB.bone['900'],
                      lineHeight: 1.3,
                    }}
                  >
                    {f}
                  </span>
                </div>
              );
            })}
            {footer && (
              <div
                style={{
                  marginTop: 28,
                  opacity: interpolate(
                    frame - (features.length * 10 + 16),
                    [0, 16],
                    [0, 1],
                    { extrapolateRight: 'clamp' },
                  ),
                }}
              >
                {footer}
              </div>
            )}
          </div>

          {(imageFile || videoFile) && (
            <div
              style={{
                flex: videoFile ? '0 0 auto' : imageFlex,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: imgOpacity,
                transform: videoFile ? `scale(${imgScale * 1.45})` : `scale(${imgScale})`,
                transformOrigin: videoFile ? 'right 85%' : 'center center',
                marginRight: videoFile ? 120 : 0,
                minWidth: 0,
                height: '100%',
              }}
            >
              {videoFile ? (
                <div
                  style={{
                    width: 'auto',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
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
                      flex: 1,
                      minHeight: 0,
                      height: 'auto',
                      width: 'auto',
                      display: 'block',
                      filter: 'contrast(1.05)',
                    }}
                  />
                  <VideoScrubber videoRef={videoRef} />
                </div>
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    border: `1px solid ${SCLAB.ink['500']}`,
                    backgroundColor: SCLAB.ink['200'],
                    padding: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <img
                    src={getAssetSrc(imageFile!)}
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
                      top: 14,
                      left: 14,
                      fontFamily: SCLAB_FONTS.mono,
                      fontSize: '0.8rem',
                      color: SCLAB.bone['500'],
                      letterSpacing: '0.25em',
                    }}
                  >
                    {mediaLabel ?? '[ STILL · 001 ]'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SlideFrame>
    </AbsoluteFill>
  );
};
