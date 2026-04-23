// SessionHeader.jsx — top bar with logo, session name, collaborators
const SessionHeader = ({ sessionName = 'Session 0114 · dark palace', collaborators = [] }) => (
  <div style={shStyles.bar}>
    <div style={shStyles.brand}>
      <img src="../../assets/logo-mark.svg" style={{width: 22, height: 22}} alt=""/>
      <div>
        <div style={shStyles.brandTitle}>Apocalypse Radio</div>
        <div style={shStyles.brandSub}>[ studio · alpha ]</div>
      </div>
    </div>
    <div style={shStyles.divider}/>
    <div style={shStyles.session}>
      <div style={shStyles.sessionEyebrow}>SESSION</div>
      <div style={shStyles.sessionName}>{sessionName}</div>
    </div>
    <div style={{flex: 1}}/>
    <div style={shStyles.collabRow}>
      <div style={shStyles.collabLabel}>ONLINE · {collaborators.length}</div>
      <div style={shStyles.avatars}>
        {collaborators.map((c, i) => (
          <div key={i} style={{...shStyles.avatar, borderColor: c.color, color: c.color, zIndex: collaborators.length - i}} title={c.name}>
            {c.initials}
          </div>
        ))}
      </div>
    </div>
    <button style={shStyles.shareBtn}>Broadcast →</button>
  </div>
);

const shStyles = {
  bar: {
    height: 48,
    background: 'var(--ink-050)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: 16,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  brandTitle: { fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--fg)', lineHeight: 1 },
  brandSub: { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-dim)', letterSpacing: '0.15em', marginTop: 2 },
  divider: { width: 1, height: 22, background: 'var(--border)' },
  session: { display: 'flex', flexDirection: 'column', gap: 2 },
  sessionEyebrow: { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-dim)', letterSpacing: '0.22em' },
  sessionName: { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--fg)', lineHeight: 1 },
  collabRow: { display: 'flex', alignItems: 'center', gap: 10 },
  collabLabel: { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-dim)', letterSpacing: '0.22em' },
  avatars: { display: 'flex' },
  avatar: {
    width: 26, height: 26, borderRadius: 999,
    background: 'var(--ink-300)',
    border: '2px solid',
    marginLeft: -6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
  },
  shareBtn: {
    background: 'var(--signal-500)',
    color: 'var(--ink-100)',
    border: 'none',
    padding: '8px 14px',
    fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 13,
    cursor: 'pointer',
  },
};

window.SessionHeader = SessionHeader;
