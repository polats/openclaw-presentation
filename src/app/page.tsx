'use client';

import React from 'react';
import { Player } from '@remotion/player';
import { OpenclawPresentation } from '../components/OpenclawPresentation';

import { loadFont } from '@remotion/google-fonts/PixelifySans';
loadFont();

export default function Presentation() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Player
        component={OpenclawPresentation}
        durationInFrames={960}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={30}
        controls
        autoPlay
        loop
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
