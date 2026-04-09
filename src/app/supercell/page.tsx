'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { SupercellPresentation } from '../../components/SupercellPresentation';

import { loadFont as loadPixelify } from '@remotion/google-fonts/PixelifySans';
import { loadFont as loadSpaceGrotesk } from '@remotion/google-fonts/SpaceGrotesk';
loadPixelify();
loadSpaceGrotesk();

const TOTAL_FRAMES = 2130;
const FPS = 30;

const SLIDES = [
  { name: 'Title', start: 0, duration: 300 },
  { name: 'WHOAMI', start: 300, duration: 210 },
  { name: 'Agenda', start: 510, duration: 210 },
  { name: 'GAME_A_DAY', start: 720, duration: 300 },
  { name: 'Details', start: 1020, duration: 210 },
  { name: 'Soulcats', start: 1230, duration: 300 },
  { name: 'Radio', start: 1530, duration: 300 },
  { name: 'Musicats', start: 1830, duration: 300 },
];

const SWIPE_THRESHOLD = 50;

export default function Presentation() {
  const playerRef = useRef<PlayerRef>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const goToSlide = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, SLIDES.length - 1));
    playerRef.current?.seekTo(SLIDES[clamped].start);
    playerRef.current?.play();
    setCurrentSlideIndex(clamped);
    setCurrentFrame(SLIDES[clamped].start);
  }, []);

  // Auto-start on load
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    // Small delay to let the player initialize
    const timeout = setTimeout(() => {
      player.play();
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  // Track current frame and auto-advance to next slide
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrameUpdate = () => {
      const frame = player.getCurrentFrame();
      setCurrentFrame(frame);
      const idx = SLIDES.findLastIndex((s) => frame >= s.start);
      if (idx >= 0) {
        const slide = SLIDES[idx];
        const slideEnd = slide.start + slide.duration - 1;
        if (frame >= slideEnd && player.isPlaying()) {
          // Pause at the end of each slide
          player.pause();
          player.seekTo(slideEnd);
        }
        setCurrentSlideIndex(idx);
      }
    };

    player.addEventListener('frameupdate', onFrameUpdate);
    return () => player.removeEventListener('frameupdate', onFrameUpdate);
  }, [goToSlide]);

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
      <div
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, cursor: 'pointer', touchAction: 'none' }}
        onClick={(e) => {
          // Let clicks on links pass through
          const target = e.target as HTMLElement;
          if (target.closest('a')) return;
          const player = playerRef.current;
          if (!player) return;
          if (player.isPlaying()) {
            player.pause();
          } else {
            player.play();
          }
        }}
        onTouchStart={(e) => {
          touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
        }}
        onTouchEnd={(e) => {
          if (!touchStartRef.current) return;
          const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
          const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
          const dt = Date.now() - touchStartRef.current.time;
          touchStartRef.current = null;

          // If horizontal swipe exceeds threshold, navigate slides
          if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
            e.preventDefault();
            if (dx < 0) {
              goToSlide(currentSlideIndex + 1);
            } else {
              goToSlide(currentSlideIndex - 1);
            }
            return;
          }

          // Short tap (< 300ms, minimal movement) = toggle play/pause, unless tapping a link
          const target = e.target as HTMLElement;
          if (dt < 300 && Math.abs(dx) < 20 && Math.abs(dy) < 20 && !target.closest('a')) {
            const player = playerRef.current;
            if (!player) return;
            if (player.isPlaying()) {
              player.pause();
            } else {
              player.play();
            }
          }
        }}
      >
        <Player
          ref={playerRef}
          component={SupercellPresentation}
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

      {/* Slide scrubber - desktop: labeled buttons, mobile: dot indicators */}
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        backgroundColor: '#111',
        borderTop: '1px solid #222',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        userSelect: 'none',
      }}>
        {SLIDES.map((slide, i) => {
          const isActive = i === currentSlideIndex;
          const progress = isActive
            ? Math.min(1, (currentFrame - slide.start) / slide.duration)
            : i < currentSlideIndex ? 1 : 0;

          return (
            <button
              key={slide.name}
              onClick={() => goToSlide(i)}
              className="scrubber-btn"
              style={{
                flex: 1,
                border: 'none',
                borderRight: i < SLIDES.length - 1 ? '1px solid #222' : 'none',
                background: 'transparent',
                position: 'relative',
                cursor: 'pointer',
                padding: '0 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? '#BAFF00' : '#666',
                fontWeight: isActive ? 700 : 400,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                transition: 'color 0.15s',
                overflow: 'hidden',
                minWidth: 0,
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
              {/* Active indicator line */}
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
              {/* Desktop: slide name, Mobile: dot */}
              <span className="scrubber-label" style={{ position: 'relative', zIndex: 1 }}>
                {slide.name}
              </span>
              <span className="scrubber-dot" style={{
                position: 'relative',
                zIndex: 1,
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isActive ? '#BAFF00' : '#444',
                display: 'none',
                flexShrink: 0,
              }} />
            </button>
          );
        })}
      </div>

      <style>{`
        .scrubber-btn { height: 48px; }
        .scrubber-dot { display: none !important; }
        .scrubber-label { display: inline !important; }
        @media (max-width: 768px) {
          .scrubber-btn { height: 36px; }
          .scrubber-dot { display: block !important; }
          .scrubber-label { display: none !important; }
        }
      `}</style>
    </div>
  );
}
