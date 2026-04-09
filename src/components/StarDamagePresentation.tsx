import React from 'react';
import {
  Sequence,
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';

const PRIMARY = '#FF2D55';
const GOLD = '#FFD700';
const BG = '#0a0a0a';
const CARD_BG = '#1C1C1E';
const GRAY = '#8E8E93';
const FONT = '"Space Grotesk", system-ui, sans-serif';

// ─── Status Bar ───────────────────────────────────────────
const StatusBar: React.FC<{ time?: string }> = ({ time = '9:41' }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 24px 0',
      fontSize: 14,
      fontWeight: 600,
      color: '#fff',
      fontFamily: FONT,
    }}
  >
    <span>{time}</span>
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <span style={{ fontSize: 12 }}>5G</span>
      <div
        style={{
          width: 22,
          height: 11,
          border: '1.5px solid #fff',
          borderRadius: 3,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 1.5,
            top: 1.5,
            bottom: 1.5,
            width: '60%',
            background: '#fff',
            borderRadius: 1,
          }}
        />
      </div>
    </div>
  </div>
);

// ─── Scene 1: Splash ─────────────────────────────────────
const SplashScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ fps, frame, config: { damping: 8, stiffness: 80 }, from: 0.3, to: 1 });
  const logoOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = spring({ fps, frame: Math.max(0, frame - 10), config: { damping: 12 }, from: 40, to: 0 });
  const titleOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' });
  const subOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: 'clamp' });

  // Glitch effect on title
  const glitchOffset = frame > 15 && frame < 50 && frame % 8 < 2 ? (frame % 3 - 1) * 2 : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT,
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${PRIMARY}22 0%, transparent 70%)`,
          opacity: interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      />

      {/* Star icon */}
      <div
        style={{
          fontSize: 72,
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          marginBottom: 16,
        }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <polygon
            points="40,5 48,30 75,30 53,47 61,73 40,57 19,73 27,47 5,30 32,30"
            fill={PRIMARY}
            stroke={GOLD}
            strokeWidth="2"
          />
          <line x1="30" y1="55" x2="25" y2="75" stroke={PRIMARY} strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="55" x2="55" y2="75" stroke={PRIMARY} strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 42,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: -1,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px) translateX(${glitchOffset}px)`,
          textShadow: glitchOffset !== 0 ? `${-glitchOffset}px 0 ${PRIMARY}, ${glitchOffset}px 0 cyan` : 'none',
        }}
      >
        STAR DAMAGE
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 15,
          color: GRAY,
          marginTop: 12,
          opacity: subOpacity,
          textAlign: 'center',
          padding: '0 40px',
          lineHeight: 1.5,
        }}
      >
        Manage an AI rockstar.{'\n'}Try not to destroy him.
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Phone Home Screen ──────────────────────────
const homeApps = [
  { name: 'Mail', color: '#007AFF', icon: '✉️' },
  { name: 'Photos', color: '#FF9500', icon: '🖼️' },
  { name: 'Camera', color: '#555', icon: '📷' },
  { name: 'Weather', color: '#34AADC', icon: '🌤️' },
  { name: 'Instagram', color: '#E1306C', icon: '📸' },
  { name: 'Spotify', color: '#1DB954', icon: '🎵' },
  { name: 'Twitter', color: '#1DA1F2', icon: '🐦' },
  { name: 'Messages', color: '#34C759', icon: '💬' },
  { name: 'Maps', color: '#4CAF50', icon: '🗺️' },
  { name: 'Calendar', color: '#FF3B30', icon: '📅' },
  { name: 'Notes', color: '#FFCC00', icon: '📝' },
  { name: 'Settings', color: '#8E8E93', icon: '⚙️' },
];

const HomeScreenScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spotify is index 5 — tap animation starts at frame 80
  const TAP_FRAME = 80;
  const spotifyTapped = frame >= TAP_FRAME;
  const tapScale = spotifyTapped
    ? spring({ fps, frame: Math.max(0, frame - TAP_FRAME), config: { damping: 15, stiffness: 300 }, from: 0.85, to: 1 })
    : 1;
  // Screen flash/zoom after tap
  const screenZoom = spotifyTapped
    ? spring({ fps, frame: Math.max(0, frame - TAP_FRAME - 8), config: { damping: 10, stiffness: 80 }, from: 1, to: 1.15 })
    : 1;
  const screenFade = interpolate(frame, [TAP_FRAME + 10, TAP_FRAME + 25], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000',
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        opacity: screenFade,
        transform: `scale(${screenZoom})`,
      }}
    >
      {/* Wallpaper gradient */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)', opacity: 0.7 }} />

      <StatusBar />

      {/* Time */}
      <div style={{ textAlign: 'center', marginTop: 40, position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 58, fontWeight: 200, color: '#fff', letterSpacing: -2 }}>9:41</div>
        <div style={{ fontSize: 14, color: '#ccc', marginTop: 2 }}>Wednesday, April 9</div>
      </div>

      {/* App grid */}
      <div
        style={{
          flex: 1,
          padding: '40px 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px 16px',
          alignContent: 'start',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {homeApps.map((app, i) => {
          const delay = 5 + i * 3;
          const iconScale = spring({
            fps,
            frame: Math.max(0, frame - delay),
            config: { damping: 12, stiffness: 120 },
            from: 0,
            to: 1,
          });
          const iconOpacity = interpolate(frame, [delay, delay + 6], [0, 1], { extrapolateRight: 'clamp' });
          const isSpotify = i === 5;

          // Tap ring effect on Spotify
          const tapRingScale = isSpotify && spotifyTapped
            ? spring({ fps, frame: Math.max(0, frame - TAP_FRAME), config: { damping: 8 }, from: 0.5, to: 2 })
            : 0;
          const tapRingOpacity = isSpotify && spotifyTapped
            ? interpolate(frame, [TAP_FRAME, TAP_FRAME + 15], [0.6, 0], { extrapolateRight: 'clamp' })
            : 0;

          return (
            <div
              key={app.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                opacity: iconOpacity,
                transform: `scale(${iconScale * (isSpotify ? tapScale : 1)})`,
                position: 'relative',
              }}
            >
              {/* Tap ring */}
              {isSpotify && spotifyTapped && (
                <div style={{
                  position: 'absolute',
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  border: '2px solid #1DB954',
                  transform: `scale(${tapRingScale})`,
                  opacity: tapRingOpacity,
                  top: 0,
                }} />
              )}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: app.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  boxShadow: isSpotify && spotifyTapped ? '0 0 20px #1DB95488' : '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                {app.icon}
              </div>
              <span style={{ fontSize: 10, color: '#fff', textAlign: 'center', opacity: 0.9 }}>
                {app.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dock */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          padding: '12px 0 28px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {['📞', '🧭', '💬', '🎵'].map((icon, i) => {
          const dockOpacity = interpolate(frame, [40 + i * 3, 46 + i * 3], [0, 1], { extrapolateRight: 'clamp' });
          return (
            <div
              key={i}
              style={{
                width: 52,
                height: 52,
                borderRadius: 13,
                background: 'rgba(100,100,110,0.5)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                opacity: dockOpacity,
              }}
            >
              {icon}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Music App / Artist Selection ───────────────
const archetypes = [
  { name: 'Johnny Vex', type: 'THE DIVA', traits: 'Ego. Drama. Sold-out shows.', listeners: '2.1M monthly listeners', emoji: '🎤' },
  { name: 'Raz Korvus', type: 'THE PUNK', traits: 'Chaos. Arrests. Cult following.', listeners: '890K monthly listeners', emoji: '🔥' },
  { name: 'Sable Moon', type: 'QUIET GENIUS', traits: 'Recluse. Rumors. Masterpieces.', listeners: '3.4M monthly listeners', emoji: '🌙' },
];

const MusicAppScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // iOS app launch: scale up from icon position
  const launchScale = spring({ fps, frame, config: { damping: 12, stiffness: 80 }, from: 0.6, to: 1 });
  const launchRadius = spring({ fps, frame, config: { damping: 12, stiffness: 80 }, from: 40, to: 0 });
  const appOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  // Exit: MANAGE tapped → zoom out
  const EXIT_FRAME = 160;
  const exitScale = frame >= EXIT_FRAME
    ? spring({ fps, frame: Math.max(0, frame - EXIT_FRAME), config: { damping: 10, stiffness: 80 }, from: 1, to: 1.1 })
    : 1;
  const exitOpacity = interpolate(frame, [EXIT_FRAME, EXIT_FRAME + 18], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const SELECT_FRAME = 120;
  const selected = frame >= SELECT_FRAME;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#121212',
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        opacity: appOpacity * exitOpacity,
        transform: `scale(${launchScale * exitScale})`,
        borderRadius: launchRadius,
        overflow: 'hidden',
      }}
    >
      <StatusBar />

      {/* Spotify-style header */}
      <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 18, color: '#fff' }}>‹</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: 1 }}>
          Search
        </div>
      </div>

      {/* Search bar */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          background: '#282828',
          borderRadius: 8,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ fontSize: 14, color: '#b3b3b3' }}>🔍</span>
          <span style={{ fontSize: 14, color: '#b3b3b3' }}>Artists to manage...</span>
        </div>
      </div>

      {/* Category pills */}
      {(() => {
        const categories = ['Rock', 'Punk', 'Alternative', 'Indie'];
        const pillsOpacity = interpolate(frame, [8, 18], [0, 1], { extrapolateRight: 'clamp' });
        return (
          <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px', opacity: pillsOpacity }}>
            {categories.map((cat, i) => (
              <div key={cat} style={{
                background: i === 0 ? '#1DB954' : '#282828',
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 600,
                color: i === 0 ? '#000' : '#fff',
              }}>
                {cat}
              </div>
            ))}
          </div>
        );
      })()}

      {/* Section title */}
      <div style={{ padding: '8px 16px 12px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Choose an artist to manage</div>
        <div style={{ fontSize: 12, color: '#b3b3b3', marginTop: 4 }}>Each one will ruin your life differently.</div>
      </div>

      {/* Artist cards */}
      <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
        {archetypes.map((a, i) => {
          const delay = 15 + i * 12;
          const cardY = spring({
            fps,
            frame: Math.max(0, frame - delay),
            config: { damping: 12, stiffness: 100 },
            from: 50,
            to: 0,
          });
          const cardOpacity = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateRight: 'clamp' });

          const isSelected = i === 0 && selected;
          const selectScale = isSelected
            ? spring({ fps, frame: Math.max(0, frame - SELECT_FRAME), config: { damping: 12 }, from: 1, to: 1.02 })
            : 1;

          return (
            <div
              key={a.name}
              style={{
                background: isSelected ? '#1DB95418' : '#181818',
                borderRadius: 12,
                padding: '12px',
                opacity: cardOpacity,
                transform: `translateY(${cardY}px) scale(${selectScale})`,
                border: isSelected ? '1.5px solid #1DB954' : '1.5px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              {/* Artist avatar */}
              <div style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                background: `linear-gradient(135deg, ${PRIMARY}66, ${GOLD}66)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                flexShrink: 0,
                boxShadow: isSelected ? '0 0 16px #1DB95444' : 'none',
              }}>
                {a.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{a.name}</div>
                  {isSelected && (
                    <div style={{ fontSize: 10, color: '#1DB954', fontWeight: 700, background: '#1DB95422', padding: '2px 6px', borderRadius: 4 }}>
                      SELECTED
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#1DB954', letterSpacing: 0.5, marginTop: 2 }}>
                  {a.type}
                </div>
                <div style={{ fontSize: 11, color: '#b3b3b3', marginTop: 3 }}>{a.listeners}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{a.traits}</div>
              </div>
              {/* Play/manage button */}
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                background: isSelected ? '#1DB954' : 'transparent',
                border: isSelected ? 'none' : '1.5px solid #555',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                color: isSelected ? '#000' : '#fff',
                flexShrink: 0,
              }}>
                {isSelected ? '▶' : '○'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Now Playing bar at bottom */}
      {(() => {
        const barOpacity = interpolate(frame, [SELECT_FRAME, SELECT_FRAME + 12], [0, 1], { extrapolateRight: 'clamp' });
        const barY = spring({
          fps,
          frame: Math.max(0, frame - SELECT_FRAME),
          config: { damping: 12 },
          from: 30,
          to: 0,
        });
        return (
          <div style={{
            margin: '10px 8px',
            background: '#282828',
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            opacity: barOpacity,
            transform: `translateY(${barY}px)`,
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 6,
              background: `linear-gradient(135deg, ${PRIMARY}, ${GOLD})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}>
              🎤
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Johnny Vex</div>
              <div style={{ fontSize: 11, color: '#1DB954' }}>Now managing...</div>
            </div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: '#000', background: '#1DB954', padding: '6px 14px', borderRadius: 20,
              transform: `scale(${frame >= EXIT_FRAME ? spring({ fps, frame: Math.max(0, frame - EXIT_FRAME), config: { damping: 15, stiffness: 300 }, from: 0.8, to: 1 }) : 1})`,
              boxShadow: frame >= EXIT_FRAME ? '0 0 16px #1DB95466' : 'none',
            }}>
              MANAGE
            </div>
          </div>
        );
      })()}

      {/* Home bar */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 20px' }}>
        <div style={{ width: 134, height: 4, borderRadius: 2, background: '#555' }} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Notification Storm ──────────────────────────
const notifications = [
  { app: 'Star Damage', title: 'Johnny Vex', body: 'bro where are you I need to talk', time: '2m ago' },
  { app: 'Star Damage', title: 'Johnny Vex', body: 'I might have punched a photographer', time: '5m ago' },
  { app: 'Star Damage', title: 'TMZ Alert', body: 'BREAKING: Rising star involved in altercation outside club', time: '8m ago' },
  { app: 'Star Damage', title: 'Johnny Vex', body: 'ok so the cops are here', time: '12m ago' },
  { app: 'Star Damage', title: 'Missed Call', body: 'Johnny Vex tried to call you (3x)', time: '15m ago' },
];

const NotificationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance: phone wakes up
  const wakeOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const wakeBrightness = interpolate(frame, [0, 12], [0.3, 1], { extrapolateRight: 'clamp' });

  // Exit: first notification tapped → expand into chat
  const TAP_NOTIF_FRAME = 125;
  const notifTapped = frame >= TAP_NOTIF_FRAME;
  const exitScale = notifTapped
    ? spring({ fps, frame: Math.max(0, frame - TAP_NOTIF_FRAME), config: { damping: 10, stiffness: 80 }, from: 1, to: 1.15 })
    : 1;
  const exitOpacity = interpolate(frame, [TAP_NOTIF_FRAME + 5, TAP_NOTIF_FRAME + 22], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000',
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        opacity: wakeOpacity * exitOpacity,
        filter: `brightness(${wakeBrightness})`,
        transform: `scale(${exitScale})`,
      }}
    >
      {/* Lock screen background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a0a 100%)',
          opacity: 0.9,
        }}
      />

      <StatusBar time="2:47" />

      {/* Time & Date */}
      <div style={{ textAlign: 'center', marginTop: 60, position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 64, fontWeight: 200, color: '#fff', letterSpacing: -2 }}>2:47</div>
        <div style={{ fontSize: 15, color: '#ccc', marginTop: 4 }}>Tuesday, April 8</div>
      </div>

      {/* Notifications */}
      <div
        style={{
          flex: 1,
          padding: '40px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {notifications.map((n, i) => {
          const delay = 20 + i * 20;
          const notifY = spring({
            fps,
            frame: Math.max(0, frame - delay),
            config: { damping: 14, stiffness: 120 },
            from: -40,
            to: 0,
          });
          const notifOpacity = interpolate(frame, [delay, delay + 8], [0, 1], {
            extrapolateRight: 'clamp',
          });
          const isUrgent = i >= 3;
          const isTappedNotif = i === 0 && notifTapped;
          const tapNotifScale = isTappedNotif
            ? spring({ fps, frame: Math.max(0, frame - TAP_NOTIF_FRAME), config: { damping: 15, stiffness: 300 }, from: 0.92, to: 1 })
            : 1;

          return (
            <div
              key={i}
              style={{
                background: isTappedNotif ? 'rgba(60, 60, 68, 0.95)' : 'rgba(40, 40, 45, 0.85)',
                backdropFilter: 'blur(20px)',
                borderRadius: 14,
                padding: '12px 14px',
                opacity: notifOpacity,
                transform: `translateY(${notifY}px) scale(${tapNotifScale})`,
                border: isTappedNotif ? `1px solid ${PRIMARY}` : isUrgent ? `1px solid ${PRIMARY}44` : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      background: PRIMARY,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                    }}
                  >
                    ★
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#ccc', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {n.app}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: GRAY }}>{n.time}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{n.title}</div>
              <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.3 }}>{n.body}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: Text Conversation ───────────────────────────
interface ChatMessage {
  from: 'star' | 'you';
  text: string;
  delay: number; // frame delay
}

const chatMessages: ChatMessage[] = [
  { from: 'star', text: "yo I got offered a gig at The Basement tonight", delay: 10 },
  { from: 'star', text: "but Mika wants me to go to this party at some producer's house", delay: 35 },
  { from: 'star', text: "what should I do", delay: 55 },
  { from: 'you', text: "Take the gig. You need the stage time.", delay: 85 },
  { from: 'star', text: "ugh fine", delay: 115 },
  { from: 'star', text: "but if Mika breaks up with me it's your fault", delay: 130 },
  { from: 'you', text: "I'll handle Mika.", delay: 160 },
  { from: 'star', text: "😂 good luck with that", delay: 180 },
];

const ChatScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance: slide in from right (opened from notification)
  const enterX = spring({ fps, frame, config: { damping: 14, stiffness: 100 }, from: 390, to: 0 });
  const enterOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  // Exit: screen darkens as call comes in
  const CALL_BANNER_FRAME = 210;
  const exitDarken = interpolate(frame, [CALL_BANNER_FRAME, CALL_BANNER_FRAME + 25], [0, 0.4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        transform: `translateX(${enterX}px)`,
        opacity: enterOpacity,
      }}
    >
      <StatusBar />

      {/* Chat header */}
      <div
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid #222',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 18, color: PRIMARY }}>‹</div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            background: `linear-gradient(135deg, ${PRIMARY}, ${GOLD})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          🎤
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Johnny Vex</div>
          <div style={{ fontSize: 11, color: '#4CD964' }}>online now</div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: '16px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          overflowY: 'hidden',
        }}
      >
        {chatMessages.map((msg, i) => {
          const msgOpacity = interpolate(frame, [msg.delay, msg.delay + 8], [0, 1], {
            extrapolateRight: 'clamp',
          });
          const msgY = spring({
            fps,
            frame: Math.max(0, frame - msg.delay),
            config: { damping: 14 },
            from: 15,
            to: 0,
          });
          const isYou = msg.from === 'you';

          // Typing indicator before message appears
          const showTyping =
            frame >= msg.delay - 15 && frame < msg.delay && i > 0;

          return (
            <React.Fragment key={i}>
              {showTyping && msg.from === 'star' && (
                <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 4, padding: '8px 14px', background: CARD_BG, borderRadius: 18 }}>
                  {[0, 1, 2].map((d) => (
                    <div
                      key={d}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: GRAY,
                        opacity: interpolate((frame + d * 5) % 20, [0, 10, 20], [0.3, 1, 0.3]),
                      }}
                    />
                  ))}
                </div>
              )}
              <div
                style={{
                  alignSelf: isYou ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  opacity: msgOpacity,
                  transform: `translateY(${msgY}px)`,
                }}
              >
                <div
                  style={{
                    background: isYou ? PRIMARY : CARD_BG,
                    color: '#fff',
                    padding: '10px 14px',
                    borderRadius: 18,
                    borderBottomRightRadius: isYou ? 4 : 18,
                    borderBottomLeftRadius: isYou ? 18 : 4,
                    fontSize: 14,
                    lineHeight: 1.4,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Input bar */}
      <div
        style={{
          padding: '10px 14px 24px',
          borderTop: '1px solid #222',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            flex: 1,
            background: CARD_BG,
            borderRadius: 20,
            padding: '10px 16px',
            fontSize: 14,
            color: GRAY,
          }}
        >
          Message Johnny...
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            background: PRIMARY,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: '#fff',
          }}
        >
          ↑
        </div>
      </div>

      {/* Darken overlay when call comes in */}
      <div style={{
        position: 'absolute', inset: 0, background: '#000', opacity: exitDarken, pointerEvents: 'none', zIndex: 10,
      }} />

      {/* Incoming call banner */}
      {frame >= CALL_BANNER_FRAME && (() => {
        const bannerY = spring({ fps, frame: Math.max(0, frame - CALL_BANNER_FRAME), config: { damping: 14, stiffness: 120 }, from: -100, to: 0 });
        const bannerOpacity = interpolate(frame, [CALL_BANNER_FRAME, CALL_BANNER_FRAME + 8], [0, 1], { extrapolateRight: 'clamp' });
        const ringPulse = Math.sin((frame - CALL_BANNER_FRAME) * 0.4) * 0.5 + 0.5;
        return (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
            padding: '8px 12px',
            opacity: bannerOpacity,
            transform: `translateY(${bannerY}px)`,
          }}>
            <div style={{
              background: 'rgba(40, 40, 45, 0.95)', backdropFilter: 'blur(20px)',
              borderRadius: 16, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              border: `1px solid rgba(52,199,89,${0.3 + ringPulse * 0.3})`,
              boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 ${8 + ringPulse * 8}px rgba(52,199,89,0.2)`,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 20,
                background: `linear-gradient(135deg, ${PRIMARY}, ${GOLD})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>🎤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Johnny Vex</div>
                <div style={{ fontSize: 11, color: '#34C759' }}>Incoming Call...</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✕</div>
                <div style={{
                  width: 32, height: 32, borderRadius: 16, background: '#34C759',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  transform: `scale(${1 + ringPulse * 0.08})`,
                }}>📞</div>
              </div>
            </div>
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};

// ─── Scene 5: Incoming Call ───────────────────────────────
const CallScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance: expand from banner
  const enterScale = spring({ fps, frame, config: { damping: 12, stiffness: 80 }, from: 0.85, to: 1 });
  const enterOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  // Exit: accept tapped → green flash
  const ACCEPT_FRAME = 95;
  const accepted = frame >= ACCEPT_FRAME;
  const exitOpacity = interpolate(frame, [ACCEPT_FRAME + 5, ACCEPT_FRAME + 22], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const ringPulse = Math.sin(frame * 0.3) * 0.5 + 0.5;
  const avatarScale = spring({ fps, frame, config: { damping: 8 }, from: 0.5, to: 1 });
  const nameOpacity = interpolate(frame, [5, 15], [0, 1], { extrapolateRight: 'clamp' });
  const buttonsY = spring({ fps, frame: Math.max(0, frame - 15), config: { damping: 12 }, from: 50, to: 0 });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #1a0a10 0%, #0a0a0a 50%, #0a1a0a 100%)',
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `scale(${enterScale})`,
        opacity: enterOpacity * exitOpacity,
      }}
    >
      <StatusBar time="2:47" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        {/* Pulse rings */}
        {[0, 1, 2].map((r) => (
          <div
            key={r}
            style={{
              position: 'absolute',
              width: 120 + r * 40,
              height: 120 + r * 40,
              borderRadius: '50%',
              border: `1px solid ${PRIMARY}`,
              opacity: Math.max(0, ringPulse - r * 0.25) * 0.3,
              top: '30%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        {/* Avatar */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            background: `linear-gradient(135deg, ${PRIMARY}, ${GOLD})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            transform: `scale(${avatarScale})`,
            boxShadow: `0 0 ${30 + ringPulse * 20}px ${PRIMARY}66`,
          }}
        >
          🎤
        </div>

        <div style={{ opacity: nameOpacity, textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginTop: 16 }}>Johnny Vex</div>
          <div style={{ fontSize: 15, color: GRAY, marginTop: 4 }}>incoming call...</div>
          <div style={{ fontSize: 12, color: PRIMARY, marginTop: 8, fontWeight: 600 }}>2:47 AM</div>
        </div>
      </div>

      {/* Accept / Decline */}
      <div
        style={{
          display: 'flex',
          gap: 60,
          marginBottom: 80,
          transform: `translateY(${buttonsY}px)`,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              background: '#FF3B30',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              boxShadow: '0 4px 20px rgba(255,59,48,0.4)',
            }}
          >
            ✕
          </div>
          <div style={{ fontSize: 12, color: GRAY, marginTop: 8 }}>Decline</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              background: '#34C759',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              boxShadow: `0 4px 20px rgba(52,199,89,${accepted ? 0.8 : 0.3 + ringPulse * 0.2})`,
              transform: `scale(${accepted ? spring({ fps, frame: Math.max(0, frame - ACCEPT_FRAME), config: { damping: 10, stiffness: 200 }, from: 0.8, to: 1.15 }) : 1 + ringPulse * 0.05})`,
            }}
          >
            📞
          </div>
          <div style={{ fontSize: 12, color: GRAY, marginTop: 8 }}>Accept</div>
        </div>
      </div>

      {/* Green flash on accept */}
      {accepted && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle, rgba(52,199,89,0.3) 0%, transparent 70%)',
          opacity: interpolate(frame, [ACCEPT_FRAME, ACCEPT_FRAME + 10, ACCEPT_FRAME + 20], [0, 0.8, 0], { extrapolateRight: 'clamp' }),
          pointerEvents: 'none',
        }} />
      )}
    </AbsoluteFill>
  );
};

// ─── Scene 6: News Feed ───────────────────────────────────
const NewsFeedScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance: slide up from bottom (like switching tabs)
  const enterY = spring({ fps, frame, config: { damping: 14, stiffness: 100 }, from: 60, to: 0 });
  const enterOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  // Exit: zoom into dashboard
  const EXIT_FRAME = 128;
  const exitScale = frame >= EXIT_FRAME
    ? spring({ fps, frame: Math.max(0, frame - EXIT_FRAME), config: { damping: 10, stiffness: 80 }, from: 1, to: 1.1 })
    : 1;
  const exitOpacity = interpolate(frame, [EXIT_FRAME, EXIT_FRAME + 20], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const cardScale = spring({ fps, frame: Math.max(0, frame - 5), config: { damping: 12 }, from: 0.95, to: 1 });
  const cardOpacity = interpolate(frame, [5, 15], [0, 1], { extrapolateRight: 'clamp' });
  const reactionsOpacity = interpolate(frame, [40, 55], [0, 1], { extrapolateRight: 'clamp' });
  const commentOpacity = interpolate(frame, [60, 75], [0, 1], { extrapolateRight: 'clamp' });
  const comment2Opacity = interpolate(frame, [85, 100], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        transform: `translateY(${enterY}px) scale(${exitScale})`,
        opacity: enterOpacity * exitOpacity,
      }}
    >
      <StatusBar />

      {/* Feed header */}
      <div
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid #222',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Feed</div>
        <div style={{ fontSize: 13, color: PRIMARY, fontWeight: 600 }}>2 new</div>
      </div>

      <div style={{ flex: 1, padding: '16px 14px', overflow: 'hidden' }}>
        {/* News card */}
        <div
          style={{
            background: CARD_BG,
            borderRadius: 16,
            overflow: 'hidden',
            opacity: cardOpacity,
            transform: `scale(${cardScale})`,
          }}
        >
          {/* Fake article image */}
          <div
            style={{
              height: 180,
              background: `linear-gradient(135deg, #1a0a10, ${PRIMARY}22, #0a0a1a)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: PRIMARY,
                background: 'rgba(0,0,0,0.7)',
                padding: '4px 10px',
                borderRadius: 4,
                position: 'absolute',
                top: 12,
                left: 12,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Breaking
            </div>
            <div style={{ fontSize: 64, opacity: 0.4 }}>📸</div>
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 60,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              }}
            />
          </div>

          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: GRAY, marginBottom: 6 }}>
              <span style={{ color: PRIMARY, fontWeight: 600 }}>TMZ</span> · 23 minutes ago
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
              Rising Star Johnny Vex Arrested Outside Nightclub After Paparazzi Confrontation
            </div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 8, lineHeight: 1.4 }}>
              Sources say the up-and-coming rocker was seen arguing with his girlfriend before the incident escalated...
            </div>

            {/* Reactions */}
            <div
              style={{
                display: 'flex',
                gap: 16,
                marginTop: 14,
                paddingTop: 12,
                borderTop: '1px solid #333',
                opacity: reactionsOpacity,
              }}
            >
              <span style={{ fontSize: 13, color: GRAY }}>😱 1.2k</span>
              <span style={{ fontSize: 13, color: GRAY }}>💬 847</span>
              <span style={{ fontSize: 13, color: GRAY }}>🔄 2.3k</span>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            style={{
              background: CARD_BG,
              borderRadius: 12,
              padding: '12px 14px',
              opacity: commentOpacity,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: GOLD }}>@venue_booker_99</div>
            <div style={{ fontSize: 13, color: '#ccc', marginTop: 4 }}>
              well there goes the Friday gig at The Roxy... 🤦
            </div>
          </div>
          <div
            style={{
              background: CARD_BG,
              borderRadius: 12,
              padding: '12px 14px',
              opacity: comment2Opacity,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5AC8FA' }}>@rockfan_2024</div>
            <div style={{ fontSize: 13, color: '#ccc', marginTop: 4 }}>
              this is somehow making me like him more lmao
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-around', padding: '10px 0 24px',
        borderTop: '1px solid #222',
      }}>
        {[
          { icon: '📰', label: 'Feed', active: true },
          { icon: '💬', label: 'Chat', active: false },
          { icon: '📊', label: 'Dashboard', active: false },
          { icon: '⚙️', label: 'Settings', active: false },
        ].map((tab, i) => {
          const isDashboard = i === 2;
          const dashTapped = isDashboard && frame >= EXIT_FRAME;
          const dashTapScale = dashTapped
            ? spring({ fps, frame: Math.max(0, frame - EXIT_FRAME), config: { damping: 15, stiffness: 300 }, from: 0.85, to: 1 })
            : 1;
          return (
            <div key={tab.label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              transform: `scale(${dashTapScale})`,
            }}>
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              <span style={{
                fontSize: 9, fontWeight: 600,
                color: dashTapped ? PRIMARY : tab.active ? '#fff' : GRAY,
              }}>{tab.label}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 7: Career Dashboard ────────────────────────────
const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance: scale up from dashboard tab
  const enterScale = spring({ fps, frame, config: { damping: 12, stiffness: 80 }, from: 0.9, to: 1 });
  const enterOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  // Exit: fade to outro
  const EXIT_FRAME = 130;
  const exitOpacity = interpolate(frame, [EXIT_FRAME, EXIT_FRAME + 18], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const headerOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });

  const stats = [
    { label: 'Fame', value: 34, color: GOLD, icon: '⭐' },
    { label: 'Health', value: 52, color: '#FF3B30', icon: '❤️' },
    { label: 'Rep', value: 18, color: PRIMARY, icon: '📈' },
  ];

  const gigs = [
    { name: 'The Basement (Tonight)', status: 'CONFIRMED', statusColor: '#34C759' },
    { name: 'The Roxy (Friday)', status: 'CANCELLED', statusColor: '#FF3B30' },
    { name: 'Open Mic @ Dusty\'s', status: 'PENDING', statusColor: GOLD },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        transform: `scale(${enterScale})`,
        opacity: enterOpacity * exitOpacity,
      }}
    >
      <StatusBar />

      <div style={{ padding: '12px 20px', borderBottom: '1px solid #222', opacity: headerOpacity }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Dashboard</div>
        <div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>Day 3 · $240 in the bank</div>
      </div>

      <div style={{ flex: 1, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
        {/* Stat bars */}
        <div
          style={{
            background: CARD_BG,
            borderRadius: 14,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {stats.map((s, i) => {
            const delay = 10 + i * 10;
            const barWidth = spring({
              fps,
              frame: Math.max(0, frame - delay),
              config: { damping: 15, stiffness: 60 },
              from: 0,
              to: s.value,
            });
            const rowOpacity = interpolate(frame, [delay, delay + 8], [0, 1], {
              extrapolateRight: 'clamp',
            });

            return (
              <div key={s.label} style={{ opacity: rowOpacity }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: '#fff', fontWeight: 600 }}>
                    {s.icon} {s.label}
                  </span>
                  <span style={{ color: s.color, fontWeight: 700 }}>{s.value}/100</span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: '#333',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${barWidth}%`,
                      background: s.color,
                      borderRadius: 4,
                      boxShadow: `0 0 8px ${s.color}66`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Warning banner */}
        {(() => {
          const warnOpacity = interpolate(frame, [50, 62], [0, 1], { extrapolateRight: 'clamp' });
          const pulse = Math.sin(frame * 0.15) * 0.15 + 0.85;
          return (
            <div
              style={{
                background: `${PRIMARY}15`,
                border: `1px solid ${PRIMARY}44`,
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                opacity: warnOpacity * pulse,
              }}
            >
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>Reputation Critical</div>
                <div style={{ fontSize: 12, color: GRAY }}>The arrest dropped your rep by 15 points</div>
              </div>
            </div>
          );
        })()}

        {/* Upcoming gigs */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 10, paddingLeft: 4 }}>
            Upcoming Gigs
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {gigs.map((g, i) => {
              const delay = 60 + i * 12;
              const gigOpacity = interpolate(frame, [delay, delay + 10], [0, 1], {
                extrapolateRight: 'clamp',
              });
              return (
                <div
                  key={g.name}
                  style={{
                    background: CARD_BG,
                    borderRadius: 12,
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: gigOpacity,
                  }}
                >
                  <span style={{ fontSize: 14, color: '#fff' }}>{g.name}</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: g.statusColor,
                      background: `${g.statusColor}22`,
                      padding: '3px 8px',
                      borderRadius: 6,
                      letterSpacing: 0.5,
                    }}
                  >
                    {g.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Money */}
        {(() => {
          const moneyOpacity = interpolate(frame, [100, 112], [0, 1], { extrapolateRight: 'clamp' });
          return (
            <div
              style={{
                background: `linear-gradient(135deg, ${GOLD}15, ${CARD_BG})`,
                border: `1px solid ${GOLD}33`,
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: moneyOpacity,
              }}
            >
              <span style={{ fontSize: 13, color: GRAY }}>💰 Tonight&apos;s gig payout</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: GOLD }}>+$120</span>
            </div>
          );
        })()}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 8: Outro ───────────────────────────────────────
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1Opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const line1Y = spring({ fps, frame, config: { damping: 12 }, from: 30, to: 0 });
  const line2Opacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: 'clamp' });
  const taglineOpacity = interpolate(frame, [50, 65], [0, 1], { extrapolateRight: 'clamp' });
  const badgeOpacity = interpolate(frame, [70, 85], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${PRIMARY}08 0%, ${BG} 40%, ${BG} 100%)`,
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#fff',
          textAlign: 'center',
          opacity: line1Opacity,
          transform: `translateY(${line1Y}px)`,
          lineHeight: 1.4,
          padding: '0 30px',
        }}
      >
        Your choices shape his story.
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#fff',
          textAlign: 'center',
          opacity: line2Opacity,
          lineHeight: 1.4,
          marginTop: 4,
          padding: '0 30px',
        }}
      >
        His story shapes your reputation.
      </div>

      <div
        style={{
          marginTop: 40,
          opacity: taglineOpacity,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 800, color: PRIMARY, letterSpacing: -1 }}>
          STAR DAMAGE
        </div>
        <div style={{ fontSize: 13, color: GRAY, marginTop: 8 }}>
          A real-time AI management game
        </div>
      </div>

      <div
        style={{
          marginTop: 40,
          background: `${PRIMARY}15`,
          border: `1px solid ${PRIMARY}44`,
          borderRadius: 30,
          padding: '12px 28px',
          fontSize: 14,
          fontWeight: 600,
          color: PRIMARY,
          opacity: badgeOpacity,
        }}
      >
        Coming Soon
      </div>
    </AbsoluteFill>
  );
};

// ─── Main Presentation ────────────────────────────────────
export const StarDamagePresentation: React.FC = () => {
  const SPLASH = 90;      // 3s
  const HOMESCREEN = 120; // 4s
  const MUSICAPP = 180;   // 6s
  const NOTIFS = 150;     // 5s
  const CHAT = 240;       // 8s
  const CALL = 120;       // 4s
  const NEWS = 150;       // 5s
  const DASHBOARD = 150;  // 5s
  const OUTRO = 150;      // 5s

  let f = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Sequence from={f} durationInFrames={SPLASH}>
        <SplashScene />
      </Sequence>

      {(() => { f += SPLASH; return null; })()}
      <Sequence from={f} durationInFrames={HOMESCREEN}>
        <HomeScreenScene />
      </Sequence>

      {(() => { f += HOMESCREEN; return null; })()}
      <Sequence from={f} durationInFrames={MUSICAPP}>
        <MusicAppScene />
      </Sequence>

      {(() => { f += MUSICAPP; return null; })()}
      <Sequence from={f} durationInFrames={NOTIFS}>
        <NotificationScene />
      </Sequence>

      {(() => { f += NOTIFS; return null; })()}
      <Sequence from={f} durationInFrames={CHAT}>
        <ChatScene />
      </Sequence>

      {(() => { f += CHAT; return null; })()}
      <Sequence from={f} durationInFrames={CALL}>
        <CallScene />
      </Sequence>

      {(() => { f += CALL; return null; })()}
      <Sequence from={f} durationInFrames={NEWS}>
        <NewsFeedScene />
      </Sequence>

      {(() => { f += NEWS; return null; })()}
      <Sequence from={f} durationInFrames={DASHBOARD}>
        <DashboardScene />
      </Sequence>

      {(() => { f += DASHBOARD; return null; })()}
      <Sequence from={f} durationInFrames={OUTRO}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
