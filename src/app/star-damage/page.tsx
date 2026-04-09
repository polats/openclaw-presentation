'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { StarDamagePresentation } from '../../components/StarDamagePresentation';

import { loadFont as loadSpaceGrotesk } from '@remotion/google-fonts/SpaceGrotesk';
loadSpaceGrotesk();

const TOTAL_FRAMES = 1350;
const FPS = 30;

const SLIDES = [
  { name: 'Splash', start: 0, duration: 90 },
  { name: 'Home', start: 90, duration: 120 },
  { name: 'Artists', start: 210, duration: 180 },
  { name: 'Notifications', start: 390, duration: 150 },
  { name: 'Chat', start: 540, duration: 240 },
  { name: 'Call', start: 780, duration: 120 },
  { name: 'News', start: 900, duration: 150 },
  { name: 'Dashboard', start: 1050, duration: 150 },
  { name: 'Outro', start: 1200, duration: 150 },
];

const SWIPE_THRESHOLD = 50;

export default function StarDamagePage() {
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
    const timeout = setTimeout(() => player.play(), 500);
    return () => clearTimeout(timeout);
  }, []);

  // Track current frame and auto-pause at slide end
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
        if (player.isPlaying()) player.pause();
        else player.play();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, goToSlide]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Player container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0,
          cursor: 'pointer',
          touchAction: 'none',
        }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('a')) return;
          const player = playerRef.current;
          if (!player) return;
          if (player.isPlaying()) player.pause();
          else player.play();
        }}
        onTouchStart={(e) => {
          touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            time: Date.now(),
          };
        }}
        onTouchEnd={(e) => {
          if (!touchStartRef.current) return;
          const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
          const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
          const dt = Date.now() - touchStartRef.current.time;
          touchStartRef.current = null;

          if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
            e.preventDefault();
            goToSlide(currentSlideIndex + (dx < 0 ? 1 : -1));
            return;
          }

          const target = e.target as HTMLElement;
          if (dt < 300 && Math.abs(dx) < 20 && Math.abs(dy) < 20 && !target.closest('a')) {
            const player = playerRef.current;
            if (!player) return;
            if (player.isPlaying()) player.pause();
            else player.play();
          }
        }}
      >
        <Player
          ref={playerRef}
          component={StarDamagePresentation}
          durationInFrames={TOTAL_FRAMES}
          compositionWidth={390}
          compositionHeight={844}
          fps={FPS}
          style={{
            width: '100%',
            height: '100%',
            maxWidth: 430,
          }}
        />
      </div>

      {/* Slide scrubber */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          backgroundColor: '#111',
          borderTop: '1px solid #222',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '11px',
          userSelect: 'none',
        }}
      >
        {SLIDES.map((slide, i) => {
          const isActive = i === currentSlideIndex;
          const progress = isActive
            ? Math.min(1, (currentFrame - slide.start) / slide.duration)
            : i < currentSlideIndex
              ? 1
              : 0;

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
                padding: '0 2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? '#FF2D55' : '#666',
                fontWeight: isActive ? 700 : 400,
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                overflow: 'hidden',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${progress * 100}%`,
                  backgroundColor: isActive ? 'rgba(255, 45, 85, 0.1)' : 'rgba(255,255,255,0.03)',
                  transition: isActive ? 'none' : 'width 0.3s',
                }}
              />
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#FF2D55',
                  }}
                />
              )}
              <span className="scrubber-label" style={{ position: 'relative', zIndex: 1 }}>
                {slide.name}
              </span>
              <span
                className="scrubber-dot"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#FF2D55' : '#444',
                  display: 'none',
                  flexShrink: 0,
                }}
              />
            </button>
          );
        })}
      </div>

      <style>{`
        .scrubber-btn { height: 44px; }
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
