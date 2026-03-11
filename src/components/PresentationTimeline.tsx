import React from 'react';
import { Sequence, AbsoluteFill } from 'remotion';
import { TitleSlide, TitleSlideProps } from './TitleSlide';

export type PresentationTimelineProps = {
  slides: (TitleSlideProps & { id: string })[];
};

export const PresentationTimeline: React.FC<PresentationTimelineProps> = ({ slides }) => {
  // We assume each slide takes 300 frames (10 seconds at 30fps) for now.
  const SLIDE_DURATION = 300;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f1014' }}>
      {slides.map((slide, index) => {
        return (
          <Sequence
            key={slide.id}
            from={index * SLIDE_DURATION}
            durationInFrames={SLIDE_DURATION}
          >
            <TitleSlide
              titleText={slide.titleText}
              subtitleText={slide.subtitleText}
              primaryColor={slide.primaryColor}
              secondaryColor={slide.secondaryColor}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
