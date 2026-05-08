import React from 'react';
import { Sequence, AbsoluteFill } from 'remotion';
import { SCLabBackground } from './sclab/SCLabBackground';
import { SCLabRoadToDemoSlide } from './sclab/SCLabRoadToDemoSlide';
import { SCLabFeatureSlide } from './sclab/SCLabFeatureSlide';
import { SCLabGameInterfaceSlide } from './sclab/SCLabGameInterfaceSlide';

export const SCLAB_0508_SLIDES = [
  { name: 'Road to Demo', duration: 330 },
  { name: '3D Workflow', duration: 1260 },
  { name: 'Gameplay Shape', duration: 300 },
  { name: 'Demo', duration: 300 },
  { name: 'Next Week', duration: 330 },
];

export const SCLAB_0508_TOTAL_FRAMES = SCLAB_0508_SLIDES.reduce(
  (a, s) => a + s.duration,
  0,
);

export const getSCLab0508SlideStarts = () => {
  let f = 0;
  return SCLAB_0508_SLIDES.map((s) => {
    const start = f;
    f += s.duration;
    return { ...s, start };
  });
};

export const SupercellLab0508Presentation: React.FC = () => {
  const starts = getSCLab0508SlideStarts();
  const total = SCLAB_0508_SLIDES.length;

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={SCLAB_0508_TOTAL_FRAMES}>
        <SCLabBackground />
      </Sequence>

      <Sequence from={starts[0].start} durationInFrames={starts[0].duration}>
        <SCLabRoadToDemoSlide
          index={1}
          total={total}
          title="Call My Ghost/Agent Road to Demo"
          highlightTrack={2}
          extraSubs={{
            2: ['scenarios', 'object interactions', 'metagame'],
          }}
          footer={
            <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
              <div
                style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: '1rem',
                  letterSpacing: '0.3em',
                  color: '#FF5A1F',
                  textTransform: 'uppercase',
                  marginRight: 8,
                }}
              >
                04-30 to 05-08
              </div>
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
                    height: 64,
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

      <Sequence from={starts[1].start} durationInFrames={starts[1].duration}>
        <SCLabFeatureSlide
          eyebrow="WORKFLOW · 3D"
          title="3D Workflow"
          titleItalic
          index={2}
          total={total}
          videoFile="videos/3d-workflow.mp4"
          features={[]}
          centerMedia
          mediaLabel="[ DEMO · 001 ]"
        />
      </Sequence>

      <Sequence from={starts[2].start} durationInFrames={starts[2].duration}>
        <SCLabGameInterfaceSlide
          index={3}
          total={total}
          title="Gameplay Shape"
          eyebrow="GAMEPLAY · SHAPE"
          panels={[
            { file: '0508/fallout-shelter.jpg', label: 'FALLOUT SHELTER' },
            { file: '0508/elder-scrolls-castles.jpg', label: 'ES: CASTLES' },
          ]}
        />
      </Sequence>

      <Sequence from={starts[3].start} durationInFrames={starts[3].duration}>
        <SCLabFeatureSlide
          eyebrow="DEMO · BUILD"
          title="demo"
          titleItalic
          index={4}
          total={total}
          imageFile="0508/build.png"
          features={[]}
          centerMedia
          mediaLabel="[ BUILD · 001 ]"
        />
      </Sequence>

      <Sequence from={starts[4].start} durationInFrames={starts[4].duration}>
        <SCLabRoadToDemoSlide
          index={5}
          total={total}
          title="Next Week"
          highlightTrack={2}
          sections={[
            {
              main: 'Supercell Polish',
              subs: [
                'Decide on Initial Gameplay',
                'Start designing FTUE and for retention',
                'Aim for small validation tests',
              ],
            },
            {
              main: 'Deepen AI Features',
              subs: [
                'Agentic Behavior',
                'AI Storyteller',
                'Svenjection: Emergent Animations and Object Behaviors',
              ],
              subColor: '#C56BFF',
            },
          ]}
          extraSubs={{
            2: ['scenarios', 'object interactions', 'metagame'],
          }}
          footer={
            <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
              <div
                style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: '1rem',
                  letterSpacing: '0.3em',
                  color: '#FF5A1F',
                  textTransform: 'uppercase',
                  marginRight: 8,
                }}
              >
                05-09 to 05-15
              </div>
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
                    height: 64,
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
    </AbsoluteFill>
  );
};
