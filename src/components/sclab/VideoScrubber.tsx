import React, { useEffect, useRef, useState } from 'react';
import { SCLAB, SCLAB_FONTS } from './theme';

type Props = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
};

const formatTime = (seconds: number) => {
  if (!isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const VideoScrubber: React.FC<Props> = ({ videoRef }) => {
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    let raf = 0;
    const tick = () => {
      if (v.duration > 0) {
        setDuration(v.duration);
        setCurrent(v.currentTime);
        setProgress(v.currentTime / v.duration);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [videoRef]);

  const seekFromClientX = (clientX: number) => {
    const v = videoRef.current;
    const track = trackRef.current;
    if (!v || !track || !(v.duration > 0)) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
    setProgress(ratio);
    setCurrent(v.currentTime);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => seekFromClientX(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        backgroundColor: SCLAB.ink['200'],
        border: `1px solid ${SCLAB.ink['500']}`,
        fontFamily: SCLAB_FONTS.mono,
        fontSize: '0.85rem',
        color: SCLAB.bone['700'],
        letterSpacing: '0.15em',
        userSelect: 'none',
      }}
    >
      <span style={{ color: SCLAB.bone['900'], minWidth: 48 }}>{formatTime(current)}</span>
      <div
        ref={trackRef}
        onMouseDown={(e) => {
          setDragging(true);
          seekFromClientX(e.clientX);
        }}
        onTouchStart={(e) => {
          if (e.touches[0]) seekFromClientX(e.touches[0].clientX);
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) seekFromClientX(e.touches[0].clientX);
        }}
        style={{
          flex: 1,
          height: 14,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          position: 'relative',
          touchAction: 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            height: 4,
            backgroundColor: SCLAB.ink['500'],
            position: 'relative',
            overflow: 'visible',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${progress * 100}%`,
              backgroundColor: SCLAB.signal['500'],
              boxShadow: `0 0 8px ${SCLAB.signal['500']}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${progress * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: 12,
              height: 12,
              backgroundColor: SCLAB.signal['500'],
              border: `2px solid ${SCLAB.bone['900']}`,
              boxShadow: `0 0 8px ${SCLAB.signal['500']}`,
            }}
          />
        </div>
      </div>
      <span style={{ minWidth: 48, textAlign: 'right' }}>{formatTime(duration)}</span>
    </div>
  );
};
