'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import {
  SupercellLabPresentation,
  SCLAB_SLIDES,
  SCLAB_TOTAL_FRAMES,
  getSCLabSlideStarts,
} from '../../components/SupercellLabPresentation';

import { loadFont as loadSpaceGrotesk } from '@remotion/google-fonts/SpaceGrotesk';
import { loadFont as loadInstrumentSerif } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';
loadSpaceGrotesk();
loadInstrumentSerif();
loadJetBrainsMono();

const FPS = 30;
const SIGNAL = '#FF5A1F';
const BONE = '#F7F3EA';

const SLIDES = getSCLabSlideStarts().map((s) => ({
  name: s.name,
  start: s.start,
  duration: s.duration,
}));

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

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const t = setTimeout(() => player.play(), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onFrame = () => {
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
    player.addEventListener('frameupdate', onFrame);
    return () => player.removeEventListener('frameupdate', onFrame);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToSlide(currentSlideIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToSlide(currentSlideIndex - 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        const p = playerRef.current;
        if (!p) return;
        p.isPlaying() ? p.pause() : p.play();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentSlideIndex, goToSlide]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0B0B0C',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
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
          const p = playerRef.current;
          if (!p) return;
          p.isPlaying() ? p.pause() : p.play();
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
            const p = playerRef.current;
            if (!p) return;
            p.isPlaying() ? p.pause() : p.play();
          }
        }}
      >
        <Player
          ref={playerRef}
          component={SupercellLabPresentation}
          durationInFrames={SCLAB_TOTAL_FRAMES}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={FPS}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Scrubber — mono labels, ink background */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          backgroundColor: '#060606',
          borderTop: `1px solid #26262B`,
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
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
                borderRight: i < SLIDES.length - 1 ? `1px solid #26262B` : 'none',
                background: 'transparent',
                position: 'relative',
                cursor: 'pointer',
                padding: '0 6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                color: isActive ? SIGNAL : '#6A6558',
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                transition: 'color 0.15s',
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
                  backgroundColor: isActive ? 'rgba(255,90,31,0.12)' : 'rgba(247,243,234,0.03)',
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
                    height: 2,
                    backgroundColor: SIGNAL,
                  }}
                />
              )}
              <span
                className="scrubber-num"
                style={{ position: 'relative', zIndex: 1, color: isActive ? BONE : '#4A4A52' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="scrubber-label" style={{ position: 'relative', zIndex: 1 }}>
                {slide.name}
              </span>
              <span
                className="scrubber-dot"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: 8,
                  height: 8,
                  backgroundColor: isActive ? SIGNAL : '#26262B',
                  display: 'none',
                  flexShrink: 0,
                }}
              />
            </button>
          );
        })}
      </div>

      <style>{`
        .scrubber-btn { height: 48px; }
        .scrubber-dot { display: none !important; }
        .scrubber-label, .scrubber-num { display: inline !important; }
        @media (max-width: 768px) {
          .scrubber-btn { height: 36px; }
          .scrubber-dot { display: block !important; }
          .scrubber-label, .scrubber-num { display: none !important; }
        }
      `}</style>
    </div>
  );
}
