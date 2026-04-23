import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { SCLAB, SCLAB_FONTS } from './theme';
import { SlideFrame, SCLabTitle, Rule } from './SCLabFrame';

type Section = {
  main: string;
  subs: string[];
};

const SECTIONS: Section[] = [
  {
    main: 'Focus on Human-Like Behavior',
    subs: [
      "It's what was fun on Call My Agent",
      'Loss of this made Call My Ghost less fun',
      'Success can cascade across other AI lab projects',
    ],
  },
  {
    main: 'Supercell Polish',
    subs: [
      'Decide on Initial Gameplay',
      'Start designing FTUE and for retention',
      'Aim for small validation tests',
    ],
  },
];

export type SCLabRoadToDemoSlideProps = {
  index: number;
  total: number;
};

export const SCLabRoadToDemoSlide: React.FC<SCLabRoadToDemoSlideProps> = ({ index, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <SlideFrame eyebrow="ROAD TO DEMO · NEXT" index={index} total={total}>
        <SCLabTitle italic size={6}>road to demo</SCLabTitle>
        <Rule width={120} />

        <div style={{ display: 'flex', gap: 72, flex: 1, minHeight: 0, paddingTop: 16 }}>
          {SECTIONS.map((section, si) => {
            const sectionDelay = si * 14;
            const mainFrame = frame - (8 + sectionDelay);
            const mainY = spring({
              fps,
              frame: mainFrame,
              config: { damping: 16, stiffness: 120 },
              from: 24,
              to: 0,
            });
            const mainOpacity = interpolate(mainFrame, [0, 16], [0, 1], {
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={si}
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 32,
                }}
              >
                {/* Section index */}
                <div
                  style={{
                    fontFamily: SCLAB_FONTS.mono,
                    fontSize: '0.9rem',
                    letterSpacing: '0.3em',
                    color: SCLAB.bone['500'],
                    textTransform: 'uppercase',
                    opacity: interpolate(mainFrame, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
                  }}
                >
                  [ TRACK · {String(si + 1).padStart(2, '0')} ]
                </div>

                {/* Main bullet */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 22,
                    transform: `translateY(${mainY}px)`,
                    opacity: mainOpacity,
                  }}
                >
                  <div
                    style={{
                      width: 5,
                      alignSelf: 'stretch',
                      backgroundColor: SCLAB.signal['500'],
                      flexShrink: 0,
                      boxShadow: `0 0 14px ${SCLAB.signal['500']}`,
                    }}
                  />
                  <div
                    style={{
                      fontFamily: SCLAB_FONTS.serif,
                      fontStyle: 'italic',
                      fontSize: '2.6rem',
                      lineHeight: 1.15,
                      color: SCLAB.bone['900'],
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {section.main}
                  </div>
                </div>

                {/* Sub-bullets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {section.subs.map((s, i) => {
                    const sFrame = frame - (24 + sectionDelay + i * 10);
                    const x = spring({
                      fps,
                      frame: sFrame,
                      config: { damping: 16, stiffness: 140 },
                      from: 32,
                      to: 0,
                    });
                    const opacity = interpolate(sFrame, [0, 14], [0, 1], {
                      extrapolateRight: 'clamp',
                    });
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 18,
                          transform: `translateX(${x}px)`,
                          opacity,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: SCLAB_FONTS.mono,
                            fontSize: '0.9rem',
                            color: SCLAB.signal['500'],
                            letterSpacing: '0.22em',
                            width: 48,
                            flexShrink: 0,
                          }}
                        >
                          {String(i + 1).padStart(2, '0')} /
                        </span>
                        <span
                          style={{
                            fontFamily: SCLAB_FONTS.sans,
                            fontSize: '1.5rem',
                            color: SCLAB.bone['700'],
                            lineHeight: 1.35,
                          }}
                        >
                          {s}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </SlideFrame>
    </AbsoluteFill>
  );
};
