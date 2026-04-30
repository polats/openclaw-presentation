import React from 'react';
import { Composition } from 'remotion';
import { TitleSlide } from '../components/TitleSlide';
import { PresentationTimeline } from '../components/PresentationTimeline';
import { OpenclawPresentation } from '../components/OpenclawPresentation';
import { SupercellPresentation } from '../components/SupercellPresentation';
import { StarDamagePresentation, STAR_DAMAGE_TOTAL_FRAMES } from '../components/StarDamagePresentation';
import { SupercellLabPresentation, SCLAB_TOTAL_FRAMES } from '../components/SupercellLabPresentation';
import { SupercellLab0429Presentation, SCLAB_0429_TOTAL_FRAMES } from '../components/SupercellLab0429Presentation';

import { loadFont } from '@remotion/google-fonts/PixelifySans';
import { loadFont as loadSpaceGrotesk } from '@remotion/google-fonts/SpaceGrotesk';
import { loadFont as loadInstrumentSerif } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';
loadFont();
loadSpaceGrotesk();
loadInstrumentSerif();
loadJetBrainsMono();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OpenclawPresentation"
        component={OpenclawPresentation}
        durationInFrames={3090} // 300 + 210 + 210 + 300 + 300 + 300 + 300 + 300 + 300 + 210 + 210 + 150
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="TitleSlide"
        component={TitleSlide}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          titleText: 'Getting Started With Openclaw',
          subtitleText: 'The next evolution of agentic coding.',
          primaryColor: '#BAFF00', // Cosmic Neon Green
          secondaryColor: '#000000',
        }}
      />
      
      <Composition
        id="SupercellPresentation"
        component={SupercellPresentation}
        durationInFrames={3090}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="StarDamagePresentation"
        component={StarDamagePresentation}
        durationInFrames={STAR_DAMAGE_TOTAL_FRAMES}
        fps={30}
        width={390}
        height={844}
      />

      <Composition
        id="SupercellLabPresentation"
        component={SupercellLabPresentation}
        durationInFrames={SCLAB_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="SupercellLab0429Presentation"
        component={SupercellLab0429Presentation}
        durationInFrames={SCLAB_0429_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="PresentationTimeline"
        component={PresentationTimeline}
        durationInFrames={600} // 2 slides * 300 frames each
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          slides: [
            {
              id: 'slide-1',
              titleText: 'Getting Started With Openclaw',
              subtitleText: 'The next evolution of agentic coding.',
              primaryColor: '#BAFF00', // Cosmic Green
              secondaryColor: '#000000',
            },
            {
              id: 'slide-2',
              titleText: 'Powered by Remotion',
              subtitleText: 'Code-driven video animations right in the browser.',
              primaryColor: '#10b981', // Emerald green
              secondaryColor: '#3b82f6', // Blue
            }
          ]
        }}
      />
    </>
  );
};

import { registerRoot } from 'remotion';
registerRoot(RemotionRoot);
