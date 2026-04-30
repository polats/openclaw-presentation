import React from 'react';
import { Sequence, AbsoluteFill } from 'remotion';
import { SCLabBackground } from './sclab/SCLabBackground';
import { SCLabRoadToDemoSlide } from './sclab/SCLabRoadToDemoSlide';

export const SCLAB_0429_SLIDES = [
  { name: 'Road to Demo', duration: 330 },
];

export const SCLAB_0429_TOTAL_FRAMES = SCLAB_0429_SLIDES.reduce(
  (a, s) => a + s.duration,
  0,
);

export const getSCLab0429SlideStarts = () => {
  let f = 0;
  return SCLAB_0429_SLIDES.map((s) => {
    const start = f;
    f += s.duration;
    return { ...s, start };
  });
};

export const SupercellLab0429Presentation: React.FC = () => {
  const starts = getSCLab0429SlideStarts();
  const total = SCLAB_0429_SLIDES.length;

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={SCLAB_0429_TOTAL_FRAMES}>
        <SCLabBackground />
      </Sequence>

      <Sequence from={starts[0].start} durationInFrames={starts[0].duration}>
        <SCLabRoadToDemoSlide index={1} total={total} />
      </Sequence>
    </AbsoluteFill>
  );
};
