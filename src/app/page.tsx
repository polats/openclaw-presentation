'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { OpenclawPresentation } from '../components/OpenclawPresentation';

import { loadFont } from '@remotion/google-fonts/PixelifySans';
loadFont();

const TOTAL_FRAMES = 3180;
const FPS = 30;

const SLIDES = [
  { name: 'Title', start: 0, duration: 300 },
  { name: 'Agenda', start: 300, duration: 210 },
  { name: 'Installing', start: 510, duration: 210 },
  { name: 'NIM Key', start: 720, duration: 300 },
  { name: 'Deploy', start: 1020, duration: 300 },
  { name: 'Config', start: 1320, duration: 300 },
  { name: 'Done!', start: 1620, duration: 300 },
  { name: 'Radio', start: 1920, duration: 300 },
  { name: 'Game', start: 2220, duration: 300 },
  { name: 'Features', start: 2520, duration: 210 },
  { name: 'Code', start: 2730, duration: 300 },
  { name: 'Outro', start: 3030, duration: 150 },
];

export default function Presentation() {
  const playerRef = useRef<PlayerRef>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);

  const goToSlide = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, SLIDES.length - 1));
    playerRef.current?.seekTo(SLIDES[clamped].start);
    playerRef.current?.play();
    setCurrentSlideIndex(clamped);
    setCurrentFrame(SLIDES[clamped].start);
  }, []);

  // Track current frame to highlight active slide
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrameUpdate = () => {
      const frame = player.getCurrentFrame();
      setCurrentFrame(frame);
      const idx = SLIDES.findLastIndex((s) => frame >= s.start);
      if (idx >= 0) {
        // Pause at the end of the current slide
        const slide = SLIDES[idx];
        const slideEnd = slide.start + slide.duration - 1;
        if (frame >= slideEnd && player.isPlaying()) {
          player.pause();
          player.seekTo(slideEnd);
        }
        setCurrentSlideIndex(idx);
      }
    };

    player.addEventListener('frameupdate', onFrameUpdate);
    return () => player.removeEventListener('frameupdate', onFrameUpdate);
  }, []);

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToSlide(currentSlideIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToSlide(currentSlideIndex - 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        const player = playerRef.current;
        if (!player) return;
        // Toggle play/pause
        if (player.isPlaying()) {
          player.pause();
        } else {
          player.play();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, goToSlide]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Player */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
        <Player
          ref={playerRef}
          component={OpenclawPresentation}
          durationInFrames={TOTAL_FRAMES}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={FPS}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>

      {/* Slide scrubber */}
      <div style={{
        height: '48px',
        display: 'flex',
        alignItems: 'stretch',
        backgroundColor: '#111',
        borderTop: '1px solid #222',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        userSelect: 'none',
      }}>
        {SLIDES.map((slide, i) => {
          const widthPercent = (slide.duration / TOTAL_FRAMES) * 100;
          const isActive = i === currentSlideIndex;
          const progress = isActive
            ? Math.min(1, (currentFrame - slide.start) / slide.duration)
            : i < currentSlideIndex ? 1 : 0;

          return (
            <button
              key={slide.name}
              onClick={() => goToSlide(i)}
              style={{
                width: `${widthPercent}%`,
                border: 'none',
                borderRight: i < SLIDES.length - 1 ? '1px solid #222' : 'none',
                background: 'transparent',
                position: 'relative',
                cursor: 'pointer',
                padding: '0 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? '#BAFF00' : '#666',
                fontWeight: isActive ? 700 : 400,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                transition: 'color 0.15s',
                overflow: 'hidden',
              }}
            >
              {/* Progress fill */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${progress * 100}%`,
                backgroundColor: isActive ? 'rgba(186, 255, 0, 0.1)' : 'rgba(255,255,255,0.03)',
                transition: isActive ? 'none' : 'width 0.3s',
              }} />
              {/* Active indicator dot */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: '#BAFF00',
                }} />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>
                {slide.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
