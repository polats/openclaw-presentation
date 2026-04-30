import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { SCLAB, SCLAB_FONTS } from './theme';
import { SlideFrame, SCLabTitle, Rule } from './SCLabFrame';
import { getAssetSrc } from './getAssetSrc';

type Game = {
  name: string;
  tag: string;
  file?: string;
};

const GAMES: Game[] = [
  { name: 'Kingdom Come: Deliverance II', tag: 'KCD2', file: 'research/kcd2.jpg' },
  { name: 'Battle Brothers', tag: 'BB', file: 'research/battle-brothers.jpg' },
  { name: 'Stardew Valley', tag: 'SDV', file: 'research/stardew-valley.jpg' },
  { name: 'RimWorld', tag: 'RIM', file: 'research/rimworld.jpg' },
  { name: 'Shadows of Doubt', tag: 'SOD', file: 'research/shadows-of-doubt.jpg' },
  { name: 'King of Dragon Pass', tag: 'KODP', file: 'research/king-of-dragon-pass.jpg' },
  { name: 'Barotrauma', tag: 'BARO', file: 'research/barotrauma.jpg' },
  { name: 'The Sims', tag: 'SIMS', file: 'research/the-sims.jpg' },
  { name: 'Skyrim · Radiant AI', tag: 'TES', file: 'research/elder-scrolls.jpg' },
  { name: 'Ghost Master', tag: 'GM', file: 'research/ghost-master.jpg' },
  { name: 'Animal Crossing', tag: 'AC', file: 'research/animal-crossing.jpg' },
  { name: 'Tomodachi Life', tag: 'TOMO', file: 'research/tomodachi-life.webp' },
  { name: 'Episode', tag: 'EP', file: 'research/episode.jpg' },
  { name: 'BitLife', tag: 'BIT', file: 'research/bitlife.jpg' },
  { name: 'Thronglets', tag: 'THRONG', file: 'research/thronglets.jpg' },
];

export type SCLabResearchCollageSlideProps = {
  index: number;
  total: number;
};

export const SCLabResearchCollageSlide: React.FC<SCLabResearchCollageSlideProps> = ({
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <SlideFrame eyebrow="RESEARCH · PRIOR ART" index={index} total={total}>
        <SCLabTitle italic size={5.4}>NPC + Story + Event Research</SCLabTitle>
        <Rule width={120} />

        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            gap: 14,
            minHeight: 0,
            paddingTop: 8,
          }}
        >
          {GAMES.map((g, i) => {
            const iFrame = frame - (10 + i * 4);
            const opacity = interpolate(iFrame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
            const scale = spring({
              fps,
              frame: iFrame,
              config: { damping: 14, stiffness: 110 },
              from: 0.94,
              to: 1,
            });

            return (
              <div
                key={g.tag}
                style={{
                  position: 'relative',
                  border: `1px solid ${SCLAB.ink['500']}`,
                  backgroundColor: SCLAB.ink['200'],
                  overflow: 'hidden',
                  opacity,
                  transform: `scale(${scale})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 0,
                  minHeight: 0,
                }}
              >
                {g.file ? (
                  <img
                    src={getAssetSrc(g.file)}
                    alt={g.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      filter: 'contrast(1.05) saturate(0.92)',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: 14,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: SCLAB_FONTS.serif,
                        fontStyle: 'italic',
                        fontSize: '1.6rem',
                        lineHeight: 1.05,
                        color: SCLAB.bone['900'],
                      }}
                    >
                      {g.name}
                    </div>
                    <div
                      style={{
                        fontFamily: SCLAB_FONTS.mono,
                        fontSize: '0.65rem',
                        color: SCLAB.bone['500'],
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                      }}
                    >
                      [ CONSOLE · NO ART ]
                    </div>
                  </div>
                )}

                {/* Tag overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    left: 6,
                    padding: '2px 6px',
                    backgroundColor: 'rgba(11,11,12,0.8)',
                    border: `1px solid ${SCLAB.signal['500']}`,
                    fontFamily: SCLAB_FONTS.mono,
                    fontSize: '0.65rem',
                    color: SCLAB.bone['900'],
                    letterSpacing: '0.22em',
                  }}
                >
                  {g.tag}
                </div>

                {/* Bottom name strip (only for image cells) */}
                {g.file && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: '6px 10px',
                      background:
                        'linear-gradient(180deg, rgba(11,11,12,0) 0%, rgba(11,11,12,0.85) 70%)',
                      fontFamily: SCLAB_FONTS.sans,
                      fontSize: '0.85rem',
                      color: SCLAB.bone['900'],
                      letterSpacing: '0.02em',
                    }}
                  >
                    {g.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SlideFrame>
    </AbsoluteFill>
  );
};
