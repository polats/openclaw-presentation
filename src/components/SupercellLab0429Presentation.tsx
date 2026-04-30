import React from 'react';
import { Sequence, AbsoluteFill } from 'remotion';
import { SCLabBackground } from './sclab/SCLabBackground';
import { SCLabRoadToDemoSlide } from './sclab/SCLabRoadToDemoSlide';
import { SCLabResearchCollageSlide } from './sclab/SCLabResearchCollageSlide';
import { SCLabFeatureSlide } from './sclab/SCLabFeatureSlide';
import { SCLabGameInterfaceSlide } from './sclab/SCLabGameInterfaceSlide';

export const SCLAB_0429_SLIDES = [
  { name: 'Road to Demo', duration: 330 },
  { name: 'Research', duration: 330 },
  { name: 'Current System', duration: 300 },
  { name: 'Game Interface', duration: 300 },
  { name: 'Next Week', duration: 330 },
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
        <SCLabRoadToDemoSlide
          index={1}
          total={total}
          title="Call My Ghost/Agent Road to Demo"
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
                04-25 to 04-29
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
        <SCLabResearchCollageSlide index={2} total={total} />
      </Sequence>

      <Sequence from={starts[2].start} durationInFrames={starts[2].duration}>
        <SCLabFeatureSlide
          eyebrow="SYSTEM · CURRENT"
          title="current system"
          titleItalic
          index={3}
          total={total}
          imageFile="0429/admin.png"
          imageFlex={3}
          mediaLabel="[ ADMIN · 001 ]"
          features={[
            'Call My Agent Context Bundling',
            'Energy / Social Needs',
            'Moodlets',
            'Schedules',
            'Storyteller',
          ]}
          footer={
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: '2.4rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                lineHeight: 1.15,
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
                maxWidth: '100%',
              }}
            >
              <a
                href="https://github.com/polats/woid"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#FF5A1F',
                  textDecoration: 'underline',
                  textUnderlineOffset: 8,
                  textDecorationThickness: 2,
                  textShadow: '0 0 18px rgba(255, 90, 31, 0.5)',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}
              >
                → github.com/<br />polats/woid
              </a>
              <a
                href="https://woid.noods.cc/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#FF5A1F',
                  textDecoration: 'underline',
                  textUnderlineOffset: 8,
                  textDecorationThickness: 2,
                  textShadow: '0 0 18px rgba(255, 90, 31, 0.5)',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}
              >
                → woid.noods.cc
              </a>
            </div>
          }
        />
      </Sequence>

      <Sequence from={starts[3].start} durationInFrames={starts[3].duration}>
        <SCLabGameInterfaceSlide index={4} total={total} />
      </Sequence>

      <Sequence from={starts[4].start} durationInFrames={starts[4].duration}>
        <SCLabRoadToDemoSlide
          index={5}
          total={total}
          title="Next Week"
          highlightTrack={2}
          extraSubs={{
            2: ['scenarios', 'object interactions', 'metagame'],
          }}
          trackFooters={{
            1: (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}
              >
                <a
                  href="https://github.com/polats/woid"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#FF5A1F',
                    textDecoration: 'underline',
                    textUnderlineOffset: 6,
                    textDecorationThickness: 2,
                    textShadow: '0 0 14px rgba(255, 90, 31, 0.4)',
                  }}
                >
                  → github.com/<br />polats/woid
                </a>
                <a
                  href="https://woid.noods.cc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#FF5A1F',
                    textDecoration: 'underline',
                    textUnderlineOffset: 6,
                    textDecorationThickness: 2,
                    textShadow: '0 0 14px rgba(255, 90, 31, 0.4)',
                  }}
                >
                  → woid.noods.cc
                </a>
              </div>
            ),
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
    </AbsoluteFill>
  );
};
