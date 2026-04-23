// LeftRail.jsx — narrow icon rail on far left of DAW
const LeftRail = ({ active = 'studio', onChange = () => {} }) => {
  const items = [
    { id: 'studio',  label: 'STUDIO',  d: 'M3 12h4l3-9 4 18 3-9h4' },
    { id: 'library', label: 'LIBRARY', d: 'M4 4h4v16H4zM10 4h4v16h-4zM16 4h4v16h-4z' },
    { id: 'agents',  label: 'AGENTS',  d: 'M12 2a5 5 0 015 5v2a5 5 0 01-10 0V7a5 5 0 015-5zM4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1' },
    { id: 'market',  label: 'MARKET',  d: 'M4 7h16l-1 13H5L4 7zM8 7V4a4 4 0 018 0v3' },
    { id: 'settings',label: 'SETTINGS',d: 'M12 2v3M12 19v3M4 12H2M22 12h-2M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2M12 8a4 4 0 100 8 4 4 0 000-8z' },
  ];
  return (
    <div style={lrStyles.wrap}>
      <div style={lrStyles.brand}>
        <img src="../../assets/logo-mark.svg" style={{width: 22, height: 22}} alt=""/>
      </div>
      {items.map(it => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          style={{
            ...lrStyles.item,
            color: active === it.id ? 'var(--signal-500)' : 'var(--fg-dim)',
            borderLeftColor: active === it.id ? 'var(--signal-500)' : 'transparent',
          }}
          title={it.label}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
            <path d={it.d}/>
          </svg>
          <span style={lrStyles.label}>{it.label}</span>
        </button>
      ))}
      <div style={{flex: 1}}/>
      <div style={lrStyles.user}>
        <div style={lrStyles.avatar}>YOU</div>
      </div>
    </div>
  );
};

const lrStyles = {
  wrap: { width: 68, flexShrink: 0, background: 'var(--ink-050)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'stretch' },
  brand: { height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border)' },
  item: { background: 'transparent', border: 'none', borderLeft: '2px solid transparent', padding: '14px 6px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' },
  label: { fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.18em' },
  user: { padding: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' },
  avatar: { width: 28, height: 28, borderRadius: 999, border: '2px solid var(--signal-500)', color: 'var(--signal-500)', fontFamily: 'var(--font-mono)', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 },
};

window.LeftRail = LeftRail;
