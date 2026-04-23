// Timeline.jsx — track list + timeline grid with clips & waveforms
const TRACKS = [
  { id: 1, name: 'Kick 808',        owner: 'YOU',     color: 'var(--track-kick)',  armed: false, solo: false, muted: false, clips: [{start: 0,  len: 32, label: 'kick_808'}, {start: 40, len: 28, label: 'kick_808'}] },
  { id: 2, name: 'Sub Bass',        owner: 'NEPTUNE', color: 'var(--track-bass)',  armed: false, solo: false, muted: false, clips: [{start: 8,  len: 48, label: 'sub_dm.wav'}] },
  { id: 3, name: 'Synth Arp',       owner: 'NEPTUNE', color: 'var(--track-synth)', armed: true,  solo: false, muted: false, clips: [{start: 16, len: 40, label: 'arp_dm_grimy'}] },
  { id: 4, name: 'Vocal Chop',      owner: 'YOU',     color: 'var(--track-vocal)', armed: false, solo: true,  muted: false, clips: [{start: 24, len: 16, label: 'vox_04'}, {start: 48, len: 20, label: 'vox_05'}] },
  { id: 5, name: 'Drum Loop',       owner: 'DECAY-7', color: 'var(--track-drum)',  armed: false, solo: false, muted: true,  clips: [{start: 0,  len: 64, label: 'breaks_144'}] },
  { id: 6, name: 'FX · Tape Stop',  owner: 'WARMBOOT',color: 'var(--track-fx)',    armed: false, solo: false, muted: false, clips: [{start: 56, len: 8,  label: 'stop_fx'}] },
];

const PX_PER_BEAT = 12;

const Ruler = () => {
  const bars = Array.from({length: 16}, (_, i) => i);
  return (
    <div style={tlStyles.ruler}>
      {bars.map(b => (
        <div key={b} style={{...tlStyles.rulerBar, width: PX_PER_BEAT * 4}}>
          <span style={tlStyles.rulerNum}>{b + 1}</span>
        </div>
      ))}
    </div>
  );
};

const Waveform = ({ width, height, color, seed = 1 }) => {
  const bars = Math.floor(width / 2);
  const pts = Array.from({length: bars}, (_, i) => {
    const h = Math.abs(Math.sin((i + seed * 7) * 0.4) * (height / 2 - 2)
                      + Math.sin((i + seed * 3) * 0.12) * (height / 4));
    return h;
  });
  return (
    <svg width={width} height={height} style={{display: 'block', position: 'absolute', inset: 0}}>
      {pts.map((h, i) => (
        <rect key={i} x={i * 2} y={height / 2 - h} width={1} height={h * 2} fill={color} opacity={0.75}/>
      ))}
    </svg>
  );
};

const Clip = ({ clip, color, trackIdx }) => (
  <div style={{
    position: 'absolute',
    left: clip.start * PX_PER_BEAT,
    width: clip.len * PX_PER_BEAT,
    top: 4,
    bottom: 4,
    background: `color-mix(in srgb, ${color} 22%, transparent)`,
    border: `1px solid ${color}`,
    overflow: 'hidden',
    cursor: 'grab',
  }}>
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: 14,
      background: color,
      color: 'var(--ink-100)',
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      fontWeight: 600,
      padding: '0 5px',
      display: 'flex', alignItems: 'center',
      letterSpacing: '0.02em',
    }}>
      {clip.label}
    </div>
    <Waveform width={clip.len * PX_PER_BEAT} height={40} color={color} seed={clip.start + trackIdx}/>
  </div>
);

const TrackHead = ({ track, onToggleArm }) => (
  <div style={tlStyles.trackHead}>
    <div style={{...tlStyles.colorStripe, background: track.color}}/>
    <div style={{flex: 1, padding: '6px 8px', minWidth: 0}}>
      <div style={tlStyles.trackName}>{track.name}</div>
      <div style={tlStyles.trackOwner}>
        <span style={{color: track.owner === 'YOU' ? 'var(--signal-500)' : 'var(--agent-500)'}}>●</span> {track.owner}
      </div>
    </div>
    <div style={tlStyles.trackBtns}>
      <button style={{...tlStyles.trackBtn, color: track.muted ? 'var(--siren-500)' : 'var(--fg-dim)', borderColor: track.muted ? 'var(--siren-500)' : 'var(--border)'}}>M</button>
      <button style={{...tlStyles.trackBtn, color: track.solo ? 'var(--phosphor-500)' : 'var(--fg-dim)', borderColor: track.solo ? 'var(--phosphor-500)' : 'var(--border)'}}>S</button>
      <button
        style={{...tlStyles.trackBtn,
          background: track.armed ? 'var(--signal-500)' : 'var(--ink-300)',
          color: track.armed ? 'var(--ink-100)' : 'var(--fg-dim)',
          borderColor: track.armed ? 'var(--signal-500)' : 'var(--border)',
        }}
        onClick={() => onToggleArm(track.id)}
      >R</button>
    </div>
  </div>
);

const Timeline = () => {
  const [tracks, setTracks] = React.useState(TRACKS);
  const [playhead, setPlayhead] = React.useState(28 * PX_PER_BEAT);

  const toggleArm = (id) => setTracks(ts => ts.map(t => t.id === id ? {...t, armed: !t.armed} : t));

  return (
    <div style={tlStyles.wrap}>
      <div style={tlStyles.leftCol}>
        <div style={tlStyles.leftHead}>
          <span style={tlStyles.leftHeadLabel}>TRACKS · {tracks.length}</span>
          <button style={tlStyles.addBtn}>+ ADD</button>
        </div>
        {tracks.map(t => <TrackHead key={t.id} track={t} onToggleArm={toggleArm}/>)}
      </div>
      <div style={tlStyles.rightCol}>
        <Ruler/>
        <div style={tlStyles.lanes}>
          {tracks.map((t, i) => (
            <div key={t.id} style={{...tlStyles.lane, background: i % 2 === 0 ? 'var(--ink-100)' : 'var(--ink-050)'}}>
              {t.clips.map((c, j) => <Clip key={j} clip={c} color={t.color} trackIdx={i}/>)}
            </div>
          ))}
          <div style={{...tlStyles.playhead, left: playhead}}>
            <div style={tlStyles.playheadFlag}/>
          </div>
        </div>
      </div>
    </div>
  );
};

const tlStyles = {
  wrap: { display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden', background: 'var(--ink-100)' },
  leftCol: { width: 260, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--ink-200)', overflowY: 'auto' },
  leftHead: { height: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', borderBottom: '1px solid var(--border)', background: 'var(--ink-300)' },
  leftHeadLabel: { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-dim)', letterSpacing: '0.22em' },
  addBtn: { background: 'transparent', border: '1px solid var(--border-strong)', color: 'var(--fg)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', padding: '3px 8px', cursor: 'pointer' },
  trackHead: { display: 'flex', alignItems: 'stretch', height: 54, borderBottom: '1px solid var(--border)' },
  colorStripe: { width: 3 },
  trackName: { fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  trackOwner: { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-dim)', marginTop: 3, letterSpacing: '0.12em' },
  trackBtns: { display: 'flex', alignItems: 'center', gap: 3, paddingRight: 8 },
  trackBtn: { width: 20, height: 20, background: 'var(--ink-300)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, cursor: 'pointer' },
  rightCol: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  ruler: { height: 28, display: 'flex', background: 'var(--ink-300)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 2 },
  rulerBar: { borderRight: '1px solid var(--border)', padding: '6px 6px', position: 'relative', flexShrink: 0 },
  rulerNum: { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-dim)', letterSpacing: '0.1em' },
  lanes: { position: 'relative', minWidth: 16 * 4 * PX_PER_BEAT },
  lane: { height: 54, borderBottom: '1px solid var(--border)', position: 'relative', backgroundImage: 'linear-gradient(to right, var(--ink-400) 1px, transparent 1px)', backgroundSize: `${PX_PER_BEAT * 4}px 100%` },
  playhead: { position: 'absolute', top: 0, bottom: 0, width: 1, background: 'var(--signal-500)', zIndex: 3, pointerEvents: 'none' },
  playheadFlag: { position: 'absolute', top: -28, left: -5, width: 11, height: 14, background: 'var(--signal-500)', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' },
};

window.Timeline = Timeline;
