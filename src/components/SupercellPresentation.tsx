import React from 'react';
import { Sequence, AbsoluteFill } from 'remotion';
import { TitleSlide } from './TitleSlide';
import { FeatureSlide } from './FeatureSlide';
import { CodeSlide } from './CodeSlide';
import { OutroSlide } from './OutroSlide';
import { StarSlide } from './StarSlide';
import { ScreenshotSlide } from './ScreenshotSlide';
import { DiagramSlide } from './DiagramSlide';
import { VideoSlide } from './VideoSlide';
import { WhoAmISlide } from './WhoAmISlide';
import { SoulcatsSlide } from './SoulcatsSlide';
import { MusicatsSlide } from './MusicatsSlide';

export const SupercellPresentation: React.FC = () => {
  const TITLE_DURATION = 300; // 10 seconds at 30fps (combined stars + title)
  const WHOAMI_DURATION = 210; // 7 seconds
  const AGENDA_DURATION = 210; // 7 seconds
  const GAMEDETAILS_DURATION = 210; // 7 seconds
  const SOULCATS_DURATION = 300; // 10 seconds
  const MUSICATS_DURATION = 300; // 10 seconds
  const HOWTO1_DURATION = 300; // 10 seconds
  const HOWTO2_DURATION = 300; // 10 seconds

  let currentFrame = 0;

  const TOTAL_DURATION = TITLE_DURATION + WHOAMI_DURATION + AGENDA_DURATION + HOWTO2_DURATION + GAMEDETAILS_DURATION + SOULCATS_DURATION + HOWTO1_DURATION + MUSICATS_DURATION;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f1014' }}>

      {/* Persistent star background across all slides */}
      <Sequence from={0} durationInFrames={TOTAL_DURATION}>
        <StarSlide />
      </Sequence>

      {/* Slide 0: Title */}
      <Sequence from={currentFrame} durationInFrames={TITLE_DURATION}>
        <TitleSlide
          titleText="Supercell AI Labs Presentation"
          subtitleText="Helsinki Spring 2026"
          primaryColor="#BAFF00"
          secondaryColor="#000000"
          fontFamily='"Space Grotesk", sans-serif'
        />
      </Sequence>

      {/* Slide 1: WHOAMI */}
      {(() => { currentFrame += TITLE_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={WHOAMI_DURATION}>
        <WhoAmISlide primaryColor="#BAFF00" />
      </Sequence>

      {/* Slide 2: Agenda */}
      {(() => { currentFrame += WHOAMI_DURATION; return null; })()}
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

      {/* Slide 3: r/game_a_day */}
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

      {/* Slide 4: r/game_a_day details */}
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

      {/* Slide 5: Soulcats */}
      {(() => { currentFrame += GAMEDETAILS_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={SOULCATS_DURATION}>
        <SoulcatsSlide primaryColor="#BAFF00" />
      </Sequence>

      {/* Slide 6: Musicats Precursor: Apocalypse Radio */}
      {(() => { currentFrame += SOULCATS_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={HOWTO1_DURATION}>
        <VideoSlide
          title="Musicats Precursor: Apocalypse Radio"
          videoFile="screenshots/apocalypse-radio-clip.mp4"
          videoDurationInSeconds={4}
          subtitle={<>Agents making their own music on <a href="https://apocalypseradio.xyz" target="_blank" rel="noopener noreferrer" style={{ color: '#BAFF00', textDecoration: 'underline', textUnderlineOffset: '6px', fontWeight: 600 }}>apocalypseradio.xyz</a></>}
          primaryColor="#BAFF00"
        />
      </Sequence>

      {/* Slide 7: Musicats */}
      {(() => { currentFrame += HOWTO1_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={MUSICATS_DURATION}>
        <MusicatsSlide primaryColor="#BAFF00" />
      </Sequence>


    </AbsoluteFill>
  );
};
