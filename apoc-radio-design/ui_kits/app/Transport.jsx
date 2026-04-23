// Transport.jsx — bottom bar: play/rec/stop, BPM, time, on-air
const Transport = ({ playing, onTogglePlay, recording, onToggleRec, bpm = 128, time = '00:01:27.412', onAir = true, listeners = 1204 }) => (
  <div style={transportStyles.bar}>
    <div style={transportStyles.group}>
      <button style={transportStyles.iconBtn} title="Prev">⏮</button>
      <button
        style={{...transportStyles.iconBtn, background: playing ? 'var(--phosphor-500)' : 'var(--ink-300)', color: playing ? 'var(--ink-100)' : 'var(--fg)'}}
        onClick={onTogglePlay}
        title={playing ? 'Pause' : 'Play'}
      >{playing ? '❚❚' : '▶'}</button>
      <button style={transportStyles.iconBtn} title="Stop">■</button>
      <button style={transportStyles.iconBtn} title="Next">⏭</button>
      <button
        style={{...transportStyles.iconBtn, color: 'var(--signal-500)', boxShadow: recording ? 'var(--glow-signal)' : 'none', border: recording ? '1px solid var(--signal-500)' : '1px solid transparent'}}
        onClick={onToggleRec}
        title="Record"
      >◉</button>
    </div>
    <div style={transportStyles.divider}/>
    <div style={transportStyles.group}>
      <div style={transportStyles.chip}><span style={transportStyles.chipKey}>BPM</span><span style={transportStyles.chipVal}>{bpm}</span></div>
      <div style={transportStyles.chip}><span style={transportStyles.chipKey}>KEY</span><span style={transportStyles.chipVal}>Dm</span></div>
      <div style={transportStyles.chip}><span style={transportStyles.chipKey}>SIG</span><span style={transportStyles.chipVal}>4/4</span></div>
    </div>
    <div style={transportStyles.time}>{time}</div>
    <div style={{flex: 1}}/>
    {onAir && (
      <div style={transportStyles.onAir}>
        <span style={transportStyles.onAirDot}/>
        <span style={transportStyles.onAirLabel}>◉ ON AIR</span>
        <span style={transportStyles.onAirMeta}>{listeners.toLocaleString()} tuned in</span>
      </div>
    )}
  </div>
);

const transportStyles = {
  bar: {
    height: 56,
    background: 'var(--ink-050)',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: 16,
    fontFamily: 'var(--font-sans)',
  },
  group: { display: 'flex', alignItems: 'center', gap: 4 },
  divider: { width: 1, height: 28, background: 'var(--border)' },
  iconBtn: {
    width: 36, height: 32,
    background: 'var(--ink-300)',
    border: '1px solid transparent',
    color: 'var(--fg)',
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-mono)',
  },
  chip: {
    display: 'flex',
    border: '1px solid var(--border-strong)',
    height: 28,
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
  },
  chipKey: { padding: '0 8px', background: 'var(--ink-300)', color: 'var(--fg-dim)', display: 'flex', alignItems: 'center', letterSpacing: '0.15em' },
  chipVal: { padding: '0 10px', background: 'var(--ink-200)', color: 'var(--fg)', display: 'flex', alignItems: 'center', fontWeight: 500 },
  time: {
    fontFamily: 'var(--font-mono)',
    fontSize: 16,
    color: 'var(--phosphor-500)',
    letterSpacing: '0.05em',
    padding: '0 10px',
    borderLeft: '1px solid var(--border)',
    borderRight: '1px solid var(--border)',
    height: 32,
    display: 'flex',
    alignItems: 'center',
  },
  onAir: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '0 12px',
    height: 32,
    border: '1px solid var(--signal-500)',
  },
  onAirDot: { width: 8, height: 8, borderRadius: 999, background: 'var(--signal-500)', boxShadow: 'var(--glow-signal)' },
  onAirLabel: { fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', color: 'var(--signal-500)', fontWeight: 600 },
  onAirMeta: { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-dim)' },
};

window.Transport = Transport;
