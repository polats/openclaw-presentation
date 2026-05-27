import React from 'react';
import { Sequence, AbsoluteFill } from 'remotion';
import { TitleSlide } from './TitleSlide';
import { FeatureSlide } from './FeatureSlide';
import { StarSlide } from './StarSlide';
import { ScreenshotSlide } from './ScreenshotSlide';
import { DualScreenshotSlide } from './DualScreenshotSlide';
import { VideoSlide } from './VideoSlide';
import { WhoAmIVideoSlide, MEDIA_GAME_A_DAY, MEDIA_SOULCATS } from './WhoAmIVideoSlide';
import { SoulcatsSlide } from './SoulcatsSlide';
import { MusicatsSlide } from './MusicatsSlide';

export const GibberishPresentation: React.FC = () => {
  const TITLE_DURATION = 300; // 10 seconds at 30fps (combined stars + title)
  const WHOAMI_DURATION = 210; // 7 seconds
  const AGENDA_DURATION = 210; // 7 seconds
  const GAMEDETAILS_DURATION = 210; // 7 seconds
  const SOULCATS_DURATION = 300; // 10 seconds
  const MUSICATS_DURATION = 300; // 10 seconds
  const MUSICATS_GAME_DURATION = 300; // 10 seconds
  const QUESTS_DURATION = 300; // 10 seconds
  const LETSPLAY_DURATION = 300; // 10 seconds
  const HOWTO1_DURATION = 300; // 10 seconds
  const HOWTO2_DURATION = 300; // 10 seconds

  let currentFrame = 0;

  const TOTAL_DURATION = TITLE_DURATION + WHOAMI_DURATION + AGENDA_DURATION + HOWTO2_DURATION + GAMEDETAILS_DURATION + SOULCATS_DURATION + HOWTO1_DURATION + MUSICATS_DURATION + MUSICATS_GAME_DURATION + QUESTS_DURATION + LETSPLAY_DURATION;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f1014' }}>

      {/* Persistent star background across all slides */}
      <Sequence from={0} durationInFrames={TOTAL_DURATION}>
        <StarSlide />
      </Sequence>

      {/* Slide 0: Title */}
      <Sequence from={currentFrame} durationInFrames={TITLE_DURATION}>
        <TitleSlide
          titleText="GIBBERISH HACKATHON"
          subtitleText="Toronto Tech Week 2026"
          primaryColor="#BAFF00"
          secondaryColor="#000000"
          fontFamily='"Space Grotesk", sans-serif'
        />
      </Sequence>

      {/* Slide 1: WHOAMI (game-a-day + soulcats) */}
      {(() => { currentFrame += TITLE_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={WHOAMI_DURATION}>
        <WhoAmIVideoSlide primaryColor="#BAFF00" media={[MEDIA_GAME_A_DAY, MEDIA_SOULCATS]} />
      </Sequence>

      {/* Slide 2: AI x GAMES x MUSIC (Apocalypse Radio) */}
      {(() => { currentFrame += WHOAMI_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={HOWTO1_DURATION}>
        <VideoSlide
          title="AI x GAMES x MUSIC"
          videoFile="screenshots/apocalypse-radio-clip.mp4"
          videoDurationInSeconds={4}
          subtitle={<>Agents making their own music on <a href="https://apocalypseradio.xyz" target="_blank" rel="noopener noreferrer" style={{ color: '#BAFF00', textDecoration: 'underline', textUnderlineOffset: '6px', fontWeight: 600 }}>apocalypseradio.xyz</a></>}
          primaryColor="#BAFF00"
        />
      </Sequence>

      {/* Slide 3: Interactivity and expressiveness via a shared language (Musicats) */}
      {(() => { currentFrame += HOWTO1_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={MUSICATS_DURATION}>
        <MusicatsSlide
          primaryColor="#BAFF00"
          title="Interactivity and expressiveness via live coding: a shared language"
          subtitle={<>Modern music can be easily expressed through a shared computation language: <a href="https://strudel.cc" target="_blank" rel="noopener noreferrer" style={{ color: '#BAFF00', textDecoration: 'underline', textUnderlineOffset: '6px', fontWeight: 600 }}>strudel.cc</a> is an example</>}
        />
      </Sequence>

      {/* Slide 4: Musicats game screen */}
      {(() => { currentFrame += MUSICATS_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={MUSICATS_GAME_DURATION}>
        <ScreenshotSlide
          title="Musicats: Massively Multiplayer Music-Making"
          imageFile="supercell/musicats-game-screen.jpeg"
          primaryColor="#BAFF00"
        />
      </Sequence>

      {/* Slide 5: Unique quests — make your own instrument */}
      {(() => { currentFrame += MUSICATS_GAME_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={QUESTS_DURATION}>
        <DualScreenshotSlide
          title="Unique Quests: Make Your Own Instrument"
          images={[
            { file: 'supercell/quest-instrument-1.png', alt: 'Make your own instrument quest' },
            { file: 'supercell/quest-instrument-2.png', alt: 'Make your own instrument quest' },
          ]}
          primaryColor="#BAFF00"
        />
      </Sequence>

      {/* Slide 7: soulcats.xyz */}
      {(() => { currentFrame += QUESTS_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={SOULCATS_DURATION}>
        <SoulcatsSlide
          primaryColor="#BAFF00"
          title="Reinvent streaming / social / digital companions"
          subtitle={<>Rethink distribution by building our own agentic ecosystem — <a href="https://soulcats.xyz" target="_blank" rel="noopener noreferrer" style={{ color: '#BAFF00', textDecoration: 'underline', textUnderlineOffset: '6px', fontWeight: 600 }}>soulcats.xyz</a></>}
        />
      </Sequence>

      {/* Slide 8: Let's Play Musicats! */}
      {(() => { currentFrame += SOULCATS_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={LETSPLAY_DURATION}>
        <VideoSlide
          title="Let's Play Musicats!"
          videoFile="supercell/lets-play-musicats.mp4"
          videoDurationInSeconds={10}
          primaryColor="#BAFF00"
        />
      </Sequence>

      {/* Slide 9: Agenda */}
      {(() => { currentFrame += LETSPLAY_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={AGENDA_DURATION}>
        <FeatureSlide
          title="Agenda"
          features={[
            "r/game_a_day - game ideation / core loops",
            "soulcats.xyz - agent identity + agentic multiplayer",
            "musicats.soulcats.space - strudel + UGC + music skills"
          ]}
          primaryColor="#BAFF00"
        />
      </Sequence>

      {/* Slide 10: r/game_a_day */}
      {(() => { currentFrame += AGENDA_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={HOWTO2_DURATION}>
        <ScreenshotSlide
          title="r/game_a_day"
          imageFile="screenshots/game-a-day.gif"
          subtitle={<>Game ideation and core loops — a game-a-day on <a href="https://reddit.com/r/game_a_day" target="_blank" rel="noopener noreferrer" style={{ color: '#BAFF00', textDecoration: 'underline', textUnderlineOffset: '6px', fontWeight: 600 }}>reddit.com/r/game_a_day</a></>}
          primaryColor="#BAFF00"
          compact
        />
      </Sequence>

      {/* Slide 11: r/game_a_day details */}
      {(() => { currentFrame += HOWTO2_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={GAMEDETAILS_DURATION}>
        <FeatureSlide
          title="r/game_a_day"
          features={[
            "50 games and counting",
            "Built on GameMaker + Godot, last few games on Godot due to app content delivery",
            'Game idea voted on by "community"',
            "Refining an agentic process: research, ideation, iteration"
          ]}
          primaryColor="#BAFF00"
          imageFile="supercell/game-a-day.png"
        />
      </Sequence>


    </AbsoluteFill>
  );
};
