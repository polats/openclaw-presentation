// AgentChat.jsx — right panel chat where humans & agents collaborate
const SEED_MESSAGES = [
  { id: 1, who: 'NEPTUNE',  role: 'agent', color: 'var(--agent-500)',    t: '00:00:42',
    text: "tuning in. what are we making tonight?" },
  { id: 2, who: 'YOU',      role: 'human', color: 'var(--signal-500)',   t: '00:00:58',
    text: "dark dnb. 144. minor key. grimy sub, broken vocal chops." },
  { id: 3, who: 'NEPTUNE',  role: 'agent', color: 'var(--agent-500)',    t: '00:01:24',
    text: "here's a 4-bar bassline in Dm. drag it onto track 3 if you want it.",
    attach: { name: 'bassline_Dm_128.wav', dur: '2.4s', color: 'var(--track-bass)' } },
  { id: 4, who: 'YOU',      role: 'human', color: 'var(--signal-500)',   t: '00:01:31',
    text: "darker. more sub. half-time." },
  { id: 5, who: 'DECAY-7',  role: 'agent', color: 'var(--phosphor-500)', t: '00:01:52',
    text: "i've got a breaks loop at 144 you can layer on top. already stretched to key.",
    attach: { name: 'breaks_144_dm.wav', dur: '8.0s', color: 'var(--track-drum)' } },
  { id: 6, who: 'NEPTUNE',  role: 'agent', color: 'var(--agent-500)',    t: '00:02:11',
    text: "reworked. tuned the fundamental. slower decay.",
    attach: { name: 'bassline_Dm_128_v2.wav', dur: '2.4s', color: 'var(--track-bass)' } },
];

const Message = ({ m }) => (
  <div style={{...acStyles.msg, borderColor: m.color, background: m.role === 'agent' ? 'color-mix(in srgb, ' + m.color + ' 6%, transparent)' : 'transparent'}}>
    <div style={acStyles.msgHead}>
      <span style={{...acStyles.who, color: m.color}}>{m.who}</span>
      <span style={acStyles.role}>{m.role === 'agent' ? 'AGENT' : 'HUMAN'}</span>
      <span style={{flex: 1}}/>
      <span style={acStyles.time}>{m.t}</span>
    </div>
    <div style={acStyles.body}>{m.text}</div>
    {m.attach && (
      <div style={{...acStyles.attach, borderColor: m.attach.color}}>
        <span style={{...acStyles.attachDot, background: m.attach.color}}/>
        <span style={acStyles.attachName}>◉ {m.attach.name}</span>
        <span style={{flex: 1}}/>
        <span style={acStyles.attachDur}>{m.attach.dur}</span>
        <button style={acStyles.attachBtn}>DRAG →</button>
      </div>
    )}
  </div>
);

const AgentChat = () => {
  const [messages, setMessages] = React.useState(SEED_MESSAGES);
  const [draft, setDraft] = React.useState('');
  const [thinking, setThinking] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  const send = () => {
    if (!draft.trim()) return;
    const t = new Date();
    const ts = `00:0${2 + Math.floor(Math.random()*3)}:${String(Math.floor(Math.random()*59)).padStart(2,'0')}`;
    setMessages(m => [...m, { id: Date.now(), who: 'YOU', role: 'human', color: 'var(--signal-500)', t: ts, text: draft.trim() }]);
    setDraft('');
    setThinking(true);
    setTimeout(() => {
      setMessages(m => [...m, {
        id: Date.now() + 1,
        who: 'NEPTUNE', role: 'agent', color: 'var(--agent-500)',
        t: ts,
        text: "on it. bouncing a new take now.",
        attach: { name: 'take_' + (Math.floor(Math.random()*900)+100) + '.wav', dur: '3.2s', color: 'var(--track-synth)' }
      }]);
      setThinking(false);
    }, 1400);
  };

  return (
    <div style={acStyles.wrap}>
      <div style={acStyles.head}>
        <div style={acStyles.headLabel}>AGENT CHAT</div>
        <div style={acStyles.headMeta}>3 agents · 1 human</div>
      </div>
      <div style={acStyles.list} ref={scrollRef}>
        {messages.map(m => <Message key={m.id} m={m}/>)}
        {thinking && (
          <div style={{...acStyles.msg, borderColor: 'var(--agent-500)', background: 'var(--agent-050)'}}>
            <div style={acStyles.msgHead}>
              <span style={{...acStyles.who, color: 'var(--agent-500)'}}>NEPTUNE</span>
              <span style={acStyles.role}>AGENT</span>
            </div>
            <div style={acStyles.thinking}>
              <span style={acStyles.dot}/>
              <span style={{...acStyles.dot, animationDelay: '0.2s'}}/>
              <span style={{...acStyles.dot, animationDelay: '0.4s'}}/>
              <span style={{marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--agent-500)', letterSpacing: '0.12em'}}>generating...</span>
            </div>
          </div>
        )}
      </div>
      <div style={acStyles.composer}>
        <div style={acStyles.composerRow}>
          <select style={acStyles.toSel}>
            <option>@ NEPTUNE</option>
            <option>@ DECAY-7</option>
            <option>@ WARMBOOT</option>
            <option>@ all agents</option>
          </select>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(); }}
            placeholder="prompt an agent..."
            style={acStyles.input}
          />
          <button onClick={send} style={acStyles.sendBtn}>SEND →</button>
        </div>
        <div style={acStyles.hints}>
          <span style={acStyles.hint}>/loop</span>
          <span style={acStyles.hint}>/stem</span>
          <span style={acStyles.hint}>/bounce</span>
          <span style={acStyles.hint}>/remix</span>
        </div>
      </div>
    </div>
  );
};

const acStyles = {
  wrap: { width: 360, flexShrink: 0, background: 'var(--ink-200)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', minHeight: 0 },
  head: { height: 28, padding: '0 12px', borderBottom: '1px solid var(--border)', background: 'var(--ink-300)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  headLabel: { fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', color: 'var(--fg-dim)' },
  headMeta: { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-dim)' },
  list: { flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 },
  msg: { borderLeft: '2px solid', padding: '8px 10px' },
  msgHead: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 },
  who: { fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em', fontWeight: 600 },
  role: { fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--fg-dim)' },
  time: { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-dim)' },
  body: { fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.45, color: 'var(--fg)' },
  attach: { marginTop: 8, border: '1px solid', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ink-100)' },
  attachDot: { width: 6, height: 6, borderRadius: 999 },
  attachName: { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg)' },
  attachDur: { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-dim)' },
  attachBtn: { background: 'transparent', border: '1px solid var(--border-strong)', color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)', fontSize: 9, padding: '3px 6px', letterSpacing: '0.15em', cursor: 'grab' },
  thinking: { display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 },
  dot: { width: 4, height: 4, borderRadius: 999, background: 'var(--agent-500)', animation: 'agentPulse 1.2s ease-in-out infinite' },
  composer: { borderTop: '1px solid var(--border)', padding: 10, background: 'var(--ink-100)' },
  composerRow: { display: 'flex', gap: 6 },
  toSel: { background: 'var(--ink-300)', border: '1px solid var(--border-strong)', color: 'var(--agent-500)', fontFamily: 'var(--font-mono)', fontSize: 11, padding: '6px 4px', outline: 'none' },
  input: { flex: 1, background: 'var(--ink-200)', border: '1px solid var(--border-strong)', color: 'var(--fg)', fontFamily: 'var(--font-sans)', fontSize: 13, padding: '7px 10px', outline: 'none' },
  sendBtn: { background: 'var(--signal-500)', color: 'var(--ink-100)', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', padding: '0 14px', cursor: 'pointer' },
  hints: { display: 'flex', gap: 6, marginTop: 8 },
  hint: { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-dim)', background: 'var(--ink-200)', border: '1px solid var(--border)', padding: '2px 6px', cursor: 'pointer' },
};

window.AgentChat = AgentChat;
