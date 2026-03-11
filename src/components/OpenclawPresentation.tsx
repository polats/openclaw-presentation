import React from 'react';
import { Sequence, AbsoluteFill } from 'remotion';
import { TitleSlide } from './TitleSlide';
import { FeatureSlide } from './FeatureSlide';
import { CodeSlide } from './CodeSlide';
import { OutroSlide } from './OutroSlide';
import { StarSlide } from './StarSlide';

export const OpenclawPresentation: React.FC = () => {
  const TITLE_DURATION = 150; // 5 seconds at 30fps
  const FEATURE_DURATION = 210; // 7 seconds
  const CODE_DURATION = 300; // 10 seconds
  const OUTRO_DURATION = 150; // 5 seconds

  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#D9D6D6' }}>
      
      {/* Slide 0: Stars */}
      <Sequence from={currentFrame} durationInFrames={150}>
        <StarSlide />
      </Sequence>
      
      {/* Slide 1: Title */}
      {(() => { currentFrame += 150; return null; })()}
      <Sequence from={currentFrame} durationInFrames={TITLE_DURATION}>
        <TitleSlide
          titleText="Getting Started With Openclaw"
          subtitleText="The next evolution of agentic coding."
          primaryColor="#BAFF00" // Neon Green
          secondaryColor="#000000"
        />
      </Sequence>
      
      {/* Slide 2: Features */}
      {(() => { currentFrame += TITLE_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={FEATURE_DURATION}>
        <FeatureSlide
          title="Why Openclaw?"
          features={[
            "Seamlessly integrates into your stack",
            "Understands deep architectural context",
            "Generates entire UI systems effortlessly"
          ]}
          primaryColor="#BAFF00"
        />
      </Sequence>

      {/* Slide 3: Code Demonstration */}
      {(() => { currentFrame += FEATURE_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={CODE_DURATION}>
        <CodeSlide
          title="Effortless Commands"
          codeText="openclaw generate --theme cosmic --stack nextjs,remotion\n\n> Initializing Next.js environment...\n> Building Remotion Presentation UI...\n> Done in 4.2s"
          primaryColor="#BAFF00"
        />
      </Sequence>

      {/* Slide 4: Outro */}
      {(() => { currentFrame += CODE_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={OUTRO_DURATION}>
        <OutroSlide
          text="Start building your agents today."
          url="cosmiclabs.org"
          primaryColor="#BAFF00"
        />
      </Sequence>

    </AbsoluteFill>
  );
};
