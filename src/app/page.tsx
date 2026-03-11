'use client';

import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { PresentationTimeline, PresentationTimelineProps } from '../components/PresentationTimeline';
import { TitleSlideProps } from '../components/TitleSlide';

import { loadFont } from '@remotion/google-fonts/PixelifySans';
loadFont();

export default function Dashboard() {
  const [slides, setSlides] = useState<PresentationTimelineProps['slides']>([
    {
      id: 'slide-1',
      titleText: 'Getting Started With Openclaw',
      subtitleText: 'The next evolution of agentic coding.',
      primaryColor: '#BAFF00', // Cosmic Neon Green
      secondaryColor: '#000000',
    },
    {
      id: 'slide-2',
      titleText: 'Powerful Integrations',
      subtitleText: 'Seamlessly works deeply within your existing stack.',
      primaryColor: '#10b981',
      secondaryColor: '#3b82f6',
    }
  ]);
  
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const handleActiveSlideChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSlides((prev) => {
      const newSlides = [...prev];
      newSlides[activeSlideIndex] = {
        ...newSlides[activeSlideIndex],
        [name]: value,
      };
      return newSlides;
    });
  };

  const activeSlide = slides[activeSlideIndex];

  return (
    <div className="app-container">
      {/* Sidebar Controls */}
      <aside className="dashboard-sidebar glass" style={{ overflowY: 'auto' }}>
        <h1 className="dashboard-title">Presentation Editor</h1>
        <p className="dashboard-subtitle">Iterate on your timeline in real-time.</p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlideIndex(index)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: activeSlideIndex === index ? 'var(--primary)' : 'var(--surface)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Slide {index + 1}
            </button>
          ))}
        </div>

        <div className="control-group">
          <label className="control-label" htmlFor="titleText">
            Title
          </label>
          <input
            type="text"
            id="titleText"
            name="titleText"
            className="input-text"
            value={activeSlide.titleText}
            onChange={handleActiveSlideChange}
          />
        </div>

        <div className="control-group">
          <label className="control-label" htmlFor="subtitleText">
            Subtitle
          </label>
          <textarea
            id="subtitleText"
            name="subtitleText"
            className="input-text"
            rows={3}
            value={activeSlide.subtitleText}
            onChange={handleActiveSlideChange}
          />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="control-group" style={{ flex: 1 }}>
            <label className="control-label" htmlFor="primaryColor">
              Primary Glow
            </label>
            <input
              type="color"
              id="primaryColor"
              name="primaryColor"
              style={{ width: '100%', height: '40px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              value={activeSlide.primaryColor}
              onChange={handleActiveSlideChange}
            />
          </div>
          <div className="control-group" style={{ flex: 1 }}>
            <label className="control-label" htmlFor="secondaryColor">
              Secondary Text Gradient
            </label>
            <input
              type="color"
              id="secondaryColor"
              name="secondaryColor"
              style={{ width: '100%', height: '40px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              value={activeSlide.secondaryColor}
              onChange={handleActiveSlideChange}
            />
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '12px' }}>
            Alternatively, run <br/><code style={{color: 'var(--primary)', padding: '4px 8px', background: 'var(--background)', borderRadius: '4px'}}>npx remotion studio</code> <br/> for the full timeline GUI!
          </p>
          <button className="btn-primary" style={{ width: '100%' }}>
            Ready to Share (Render MP4)
          </button>
        </div>
      </aside>

      {/* Main Preview Area */}
      <main className="player-area">
        <div 
          style={{ 
            boxShadow: '0 50px 100px rgba(0,0,0,0.5)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          <Player
            component={PresentationTimeline}
            inputProps={{ slides }}
            durationInFrames={slides.length * 300} // 10 seconds per slide
            compositionWidth={1920}
            compositionHeight={1080}
            fps={30}
            controls
            autoPlay
            loop
            style={{
              width: '100%',
              maxWidth: '1200px', // Responsive container
              aspectRatio: '16/9',
            }}
          />
        </div>
      </main>
    </div>
  );
}
