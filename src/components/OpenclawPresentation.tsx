import React from 'react';
import { Sequence, AbsoluteFill } from 'remotion';
import { TitleSlide } from './TitleSlide';
import { FeatureSlide } from './FeatureSlide';
import { CodeSlide } from './CodeSlide';
import { OutroSlide } from './OutroSlide';
import { StarSlide } from './StarSlide';
import { ScreenshotSlide } from './ScreenshotSlide';
import { VideoSlide } from './VideoSlide';

export const OpenclawPresentation: React.FC = () => {
  const TITLE_DURATION = 300; // 10 seconds at 30fps (combined stars + title)
  const AGENDA_DURATION = 210; // 7 seconds
  const INSTALL_DURATION = 210; // 7 seconds
  const NIM_KEY_DURATION = 300; // 10 seconds
  const DEPLOY_DURATION = 300; // 10 seconds
  const CONFIG_DURATION = 300; // 10 seconds
  const DONE_DURATION = 300; // 10 seconds
  const HOWTO1_DURATION = 300; // 10 seconds
  const HOWTO2_DURATION = 300; // 10 seconds
  const FEATURE_DURATION = 210; // 7 seconds
  const CODE_DURATION = 300; // 10 seconds
  const OUTRO_DURATION = 150; // 5 seconds

  let currentFrame = 0;

  const TOTAL_DURATION = TITLE_DURATION + AGENDA_DURATION + INSTALL_DURATION + NIM_KEY_DURATION + DEPLOY_DURATION + CONFIG_DURATION + DONE_DURATION + HOWTO1_DURATION + HOWTO2_DURATION + FEATURE_DURATION + CODE_DURATION + OUTRO_DURATION;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f1014' }}>

      {/* Persistent star background across all slides */}
      <Sequence from={0} durationInFrames={TOTAL_DURATION}>
        <StarSlide />
      </Sequence>

      {/* Slide 0: Title */}
      <Sequence from={currentFrame} durationInFrames={TITLE_DURATION}>
        <TitleSlide
          titleText="Getting Started With Openclaw"
          subtitleText="For free, in the fewest clicks, and safest way possible"
          primaryColor="#BAFF00"
          secondaryColor="#000000"
        />
      </Sequence>

      {/* Slide 1: Agenda */}
      {(() => { currentFrame += TITLE_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={AGENDA_DURATION}>
        <FeatureSlide
          title="Agenda"
          features={[
            "Installing Openclaw",
            "How I use it",
            "Why you need it"
          ]}
          primaryColor="#BAFF00"
        />
      </Sequence>

      {/* Slide 2: Installing Openclaw */}
      {(() => { currentFrame += AGENDA_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={INSTALL_DURATION}>
        <FeatureSlide
          title="Installing Openclaw"
          features={[
            "Get a free NVIDIA NIM key",
            "Deploy Openclaw on Railway",
            "Start chatting with your new AI friend"
          ]}
          primaryColor="#BAFF00"
        />
      </Sequence>

      {/* Slide 3: NVIDIA NIM Key */}
      {(() => { currentFrame += INSTALL_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={NIM_KEY_DURATION}>
        <ScreenshotSlide
          title="Get a Free NVIDIA NIM Key"
          imageFile="screenshots/installing-openclaw-1.png"
          subtitle='Get an NVIDIA NIM API key from'
          highlightText='https://build.nvidia.com/settings/api-keys'
          footnote='example: nvapi-**********gb3'
          note='Save this key somewhere safe — you will need it in the next step!'
          primaryColor="#BAFF00"
        />
      </Sequence>

      {/* Slide 4: Deploy on Railway */}
      {(() => { currentFrame += NIM_KEY_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={DEPLOY_DURATION}>
        <ScreenshotSlide
          title="Deploy on Railway"
          imageFile="screenshots/installing-openclaw-2.png"
          subtitle='Deploy the free-the-claw container on Railway:'
          highlightText='https://railway.com/deploy/free-the-claw'
          primaryColor="#BAFF00"
        />
      </Sequence>

      {/* Slide 5: Configure Variables */}
      {(() => { currentFrame += DEPLOY_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={CONFIG_DURATION}>
        <ScreenshotSlide
          title="Configure Variables"
          imageFile="screenshots/installing-openclaw-3.png"
          subtitle={<>Set your <span style={{ color: '#BAFF00', fontFamily: 'monospace', fontWeight: 600 }}>OPENCLAW_GATEWAY_TOKEN</span> (make it secure) and <span style={{ color: '#BAFF00', fontFamily: 'monospace', fontWeight: 600 }}>NVIDIA_NIM_API_KEY</span></>}
          primaryColor="#BAFF00"
        />
      </Sequence>

      {/* Slide 6: Done */}
      {(() => { currentFrame += CONFIG_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={DONE_DURATION}>
        <ScreenshotSlide
          title="Start Chatting!"
          imageFile="screenshots/installing-openclaw-4.png"
          subtitle={<>{'\uD83E\uDD9E'} DONE! Now go to:<br/><span style={{ color: '#BAFF00', fontFamily: 'monospace', fontWeight: 600 }}>{'https://{YOUR_RAILWAY_PROJECT_URL}#token={OPENCLAW_GATEWAY_TOKEN}'}</span></>}
          primaryColor="#BAFF00"
        />
      </Sequence>

      {/* Slide 7: How I Use It #1 */}
      {(() => { currentFrame += DONE_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={HOWTO1_DURATION}>
        <VideoSlide
          title="How I Use It #1: Apocalypse Radio"
          videoFile="screenshots/apocalypse-radio-clip.mp4"
          videoDurationInSeconds={4}
          subtitle={<>Agents making their own music on <a href="https://apocalypseradio.xyz" target="_blank" rel="noopener noreferrer" style={{ color: '#BAFF00', textDecoration: 'underline', textUnderlineOffset: '6px', fontWeight: 600 }}>apocalypseradio.xyz</a></>}
          primaryColor="#BAFF00"
        />
      </Sequence>

      {/* Slide 8: How I Use It #2 */}
      {(() => { currentFrame += HOWTO1_DURATION; return null; })()}
      <Sequence from={currentFrame} durationInFrames={HOWTO2_DURATION}>
        <ScreenshotSlide
          title="How I Use It #2: Game-A-Day"
          imageFile="screenshots/game-a-day.gif"
          subtitle={<>Game Dev Agent making a game-a-day on <a href="https://reddit.com/r/game_a_day_dev" target="_blank" rel="noopener noreferrer" style={{ color: '#BAFF00', textDecoration: 'underline', textUnderlineOffset: '6px', fontWeight: 600 }}>reddit.com/r/game_a_day_dev</a></>}
          primaryColor="#BAFF00"
        />
      </Sequence>

      {/* Slide 9: Features */}
      {(() => { currentFrame += HOWTO2_DURATION; return null; })()}
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
