import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SCLAB } from './theme';

// SVG fractal noise — inlined as data URI so it works in render.
const GRAIN_SVG = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>
    <filter id='n'>
      <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
      <feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/>
    </filter>
    <rect width='100%' height='100%' filter='url(#n)'/>
  </svg>`
);

export const SCLabBackground: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: SCLAB.ink['100'], pointerEvents: 'none' }}>
    {/* Scanlines */}
    <AbsoluteFill
      style={{
        background:
          'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px)',
      }}
    />
    {/* Grain */}
    <AbsoluteFill
      style={{
        backgroundImage: `url("data:image/svg+xml,${GRAIN_SVG}")`,
        backgroundSize: '220px 220px',
        opacity: 0.08,
        mixBlendMode: 'overlay',
      }}
    />
    {/* Vignette */}
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)',
      }}
    />
  </AbsoluteFill>
);
