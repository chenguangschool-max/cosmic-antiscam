import { useGame } from '../GameContext'

export default function MainMenu({ navigate }) {
  const { coins, level, getXpProgress, monsters } = useGame()
  const { cur, range, pct, next } = getXpProgress()
  const unlocked = monsters.filter(m => m.unlocked).length

  return (
    <div style={{ padding:18, position:'relative', zIndex:2, minHeight:'100vh' }}>
      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
        <div style={chip('#5b8dee')}>Lv.<strong>{level}</strong></div>
        <div style={coinBadge}>🪙 {coins}</div>
        <div style={{ marginLeft:'auto' }}>
          <button style={iconBtn} onClick={() => navigate('shop')}>🛒</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ textAlign:'center', margin:'6px 0 18px', position:'relative', zIndex:2 }}>
        <div style={{
          width:76, height:76,
          background:'radial-gradient(circle at 35% 35%,#5b8dee,#1a2f6e)',
          borderRadius:'50%', margin:'0 auto 10px',
          boxShadow:'0 0 26px rgba(91,141,238,.4),inset -8px -8px 16px rgba(0,0,0,.5)',
          animation:'float 3s ease-in-out infinite', position:'relative',
        }}>
          <div style={{
            position:'absolute', width:115, height:24,
            border:'3px solid rgba(100,180,255,.28)', borderRadius:'50%',
            top:'50%', left:'50%', transform:'translate(-50%,-50%) rotateX(72deg)',
          }} />
        </div>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:17, fontWeight:900, color:'#fff', letterSpacing:2, textShadow:'0 0 18px rgba(91,141,238,.7)' }}>
          宇宙防詐任務
        </div>
        <div style={{ fontSize:11, color:'rgba(180,200,255,.45)', marginTop:3 }}>COSMIC ANTI-SCAM MISSION</div>
        {/* XP bar */}
        <div style={{ maxWidth:300, margin:'10px auto 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(140,180,255,.45)', marginBottom:3 }}>
            <span>XP {cur}</span><span>Lv.{level+1} 需 {next}</span>
          </div>
          <div style={{ height:4, background:'rgba(255,255,255,.07)', borderRadius:4, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#a78bfa,#5b8dee)', borderRadius:4, transition:'width .6s' }} />
          </div>
        </div>
      </div>

      {/* Menu grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, maxWidth:440, margin:'0 auto' }}>
        <button style={{ ...menuBtn, ...btnStart, gridColumn:'1/-1' }} onClick={() => navigate('modeSelect')}>
          <span style={{ fontSize:19 }}>🚀</span>
          <span style={{ fontSize:14, letterSpacing:1 }}>▶ 開始遊戲</span>
        </button>
        <button style={{ ...menuBtn, background:'rgba(80,200,240,.07)', borderColor:'rgba(80,200,240,.28)', color:'#94e8ff' }} onClick={() => navigate('codex')}>
          <span style={{ fontSize:19 }}>📖</span>
          <div><div style={{ fontSize:13, fontWeight:500 }}>圖鑑</div><div style={{ fontSize:10, opacity:.6 }}>收集 {unlocked}/30</div></div>
        </button>
        <button style={{ ...menuBtn, background:'rgba(255,180,50,.09)', borderColor:'rgba(255,180,50,.28)', color:'#ffd27a' }} onClick={() => navigate('shop')}>
          <span style={{ fontSize:19 }}>🛒</span>
          <div><div style={{ fontSize:13, fontWeight:500 }}>商店</div><div style={{ fontSize:10, opacity:.6 }}>購買道具</div></div>
        </button>
        <button style={{ ...menuBtn, background:'rgba(255,80,120,.09)', borderColor:'rgba(255,80,120,.32)', color:'#ffaac0' }} onClick={() => navigate('multiSetup')}>
          <span style={{ fontSize:19 }}>👥</span>
          <div><div style={{ fontSize:13, fontWeight:500 }}>多人對戰</div><div style={{ fontSize:10, opacity:.6 }}>輪流答題</div></div>
        </button>
        <button style={{ ...menuBtn, background:'rgba(80,200,120,.09)', borderColor:'rgba(80,200,120,.32)', color:'#7ee8a0' }} onClick={() => navigate('onlineLobby')}>
          <span style={{ fontSize:19 }}>🌐</span>
          <div><div style={{ fontSize:13, fontWeight:500 }}>連線對戰</div><div style={{ fontSize:10, opacity:.6 }}>即時同步</div></div>
        </button>
      </div>
    </div>
  )
}

const chip = (color) => ({
  background:`rgba(${color === '#5b8dee' ? '91,141,238' : '255,210,50'},.2)`,
  border:`1px solid rgba(${color === '#5b8dee' ? '91,141,238' : '255,210,50'},.42)`,
  borderRadius:20, padding:'4px 11px',
  fontFamily:'Orbitron,monospace', fontSize:11, color:'#c8dbff',
})
const coinBadge = { display:'flex', alignItems:'center', gap:5, background:'rgba(255,210,50,.1)', border:'1px solid rgba(255,210,50,.32)', borderRadius:20, padding:'4px 12px', color:'var(--gold)', fontSize:13, fontWeight:500 }
const iconBtn = { background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.14)', borderRadius:20, padding:'5px 13px', color:'rgba(180,200,255,.7)', fontSize:12, cursor:'pointer' }
const menuBtn = { display:'flex', alignItems:'center', gap:8, padding:'12px 13px', borderRadius:12, border:'1px solid', cursor:'pointer', textAlign:'left', fontFamily:'Noto Sans TC,sans-serif' }
const btnStart = { background:'rgba(91,141,238,.17)', borderColor:'rgba(91,141,238,.52)', color:'#c8dbff', justifyContent:'center', padding:'15px' }
