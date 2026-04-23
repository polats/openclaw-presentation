import React from 'react';
import { Sequence, AbsoluteFill } from 'remotion';
import { SCLabBackground } from './sclab/SCLabBackground';
import { SCLabTitleSlide } from './sclab/SCLabTitleSlide';
import { SCLabFeatureSlide } from './sclab/SCLabFeatureSlide';
import { SCLabVideoSlide } from './sclab/SCLabVideoSlide';
import { SCLabCallMyAgentSlide } from './sclab/SCLabCallMyAgentSlide';
import { SCLabHypothesisSlide } from './sclab/SCLabHypothesisSlide';
import { SCLabNewHypothesisSlide } from './sclab/SCLabNewHypothesisSlide';
import { SCLabRoadToDemoSlide } from './sclab/SCLabRoadToDemoSlide';

export const SCLAB_SLIDES = [
  { name: 'Title', duration: 300 },
  { name: 'Previously', duration: 300 },
  { name: 'Call My Agent', duration: 300 },
  { name: 'Hypothesis', duration: 300 },
  { name: 'New Hypothesis', duration: 300 },
  { name: 'Call My Ghost', duration: 300 },
  { name: 'Road to Demo', duration: 330 },
];

export const SCLAB_TOTAL_FRAMES = SCLAB_SLIDES.reduce((a, s) => a + s.duration, 0);

export const getSCLabSlideStarts = () => {
  let f = 0;
  return SCLAB_SLIDES.map((s) => {
    const start = f;
    f += s.duration;
    return { ...s, start };
  });
};

export const SupercellLabPresentation: React.FC = () => {
  const starts = getSCLabSlideStarts();
  const total = SCLAB_SLIDES.length;

  return (
    <AbsoluteFill>
      {/* Persistent grain/scanline background across all slides */}
      <Sequence from={0} durationInFrames={SCLAB_TOTAL_FRAMES}>
        <SCLabBackground />
      </Sequence>

      <Sequence from={starts[0].start} durationInFrames={starts[0].duration}>
        <SCLabTitleSlide
          titleText="Show & Tell: April 18-24"
          subtitleText="progress on Call My Agent and new prototype: Call My Ghost"
          index={1}
          total={total}
        />
      </Sequence>

      <Sequence from={starts[1].start} durationInFrames={starts[1].duration}>
        <SCLabFeatureSlide
          eyebrow="RECAP · PREVIOUSLY"
          title="previously on.."
          titleItalic
          index={2}
          total={total}
          videoFile="videos/StarDamage.mp4"
          videoPlaybackRate={1.5}
          mediaLabel="[ ◉ STAR DAMAGE ]"
          features={[
            'Star Damage — Call My Agent precursor',
            "play as a rockstar's manager",
            'rockstars are actual LLMs you must manage',
            'content created via generative AI (songs, Instagram posts)',
          ]}
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
              {[
                { code: 'au', alt: 'Australia' },
                { code: 'fr', alt: 'France' },
                { code: 'ca', alt: 'Canada' },
              ].map((f) => (
                <img
                  key={f.code}
                  src={`https://flagcdn.com/w320/${f.code}.png`}
                  alt={f.alt}
                  style={{
                    height: 108,
                    width: 'auto',
                    border: '1px solid #26262B',
                    display: 'block',
                  }}
                />
              ))}
            </div>
          }
        />
      </Sequence>

      <Sequence from={starts[2].start} durationInFrames={starts[2].duration}>
        <SCLabCallMyAgentSlide index={3} total={total} />
      </Sequence>

      <Sequence from={starts[3].start} durationInFrames={starts[3].duration}>
        <SCLabHypothesisSlide index={4} total={total} />
      </Sequence>

      <Sequence from={starts[4].start} durationInFrames={starts[4].duration}>
        <SCLabNewHypothesisSlide index={5} total={total} />
      </Sequence>

      <Sequence from={starts[5].start} durationInFrames={starts[5].duration}>
        <SCLabVideoSlide
          eyebrow="PROTOTYPE · CALL MY GHOST"
          title="Call My Ghost"
          titleItalic
          index={6}
          total={total}
          videoFile="videos/CallMyGhost.mp4"
        />
      </Sequence>

      <Sequence from={starts[6].start} durationInFrames={starts[6].duration}>
        <SCLabRoadToDemoSlide index={7} total={total} />
      </Sequence>
    </AbsoluteFill>
  );
};
