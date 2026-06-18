import { useState } from 'react'

const COLORS = ['#5b8dee', '#a78bfa', '#34d399', '#fb923c']
const DEFAULT_AVATARS = ['', '👾', '🌟', '🎮']

function AvatarBubble({ avatar, color, index, size = 32 }) {
  if (avatar && avatar.startsWith('data:')) {
    return <img src={avatar} alt="av" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${color}99` }} />
  }
  if (avatar && !avatar.startsWith('data:')) {
    return <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: `${color}33`, border: `2px solid ${color}77`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5 }}>{avatar}</div>
  }
  return <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.42, fontWeight: 800, color: '#fff' }}>{index + 1}</div>
}

export default function MultiSetup({ navigate, onStart }) {
  const [count, setCount] = useState(2)
  const savedName = localStorage.getItem('playerName') || '玩家1'
  const p1Avatar = JSON.parse(localStorage.getItem('playerProfile') || '{}').avatar || '🧑‍🚀'

  const getAvatar = (i) => i === 0 ? p1Avatar : DEFAULT_AVATARS[i]

  const handleStart = () => {
    const players = Array.from({ length: count }, (_, i) =>
      i === 0 ? savedName : `玩家${i + 1}`
    )
    onStart(players)
  }

  const previewNames = Array.from({ length: count }, (_, i) =>
    i === 0 ? savedName : `玩家${i + 1}`
  )

  return (
    <div style={{ padding: 18, position: 'relative', zIndex: 2 }}>
      <button onClick={() => navigate('menu')} style={backBtn}>← 返回</button>

      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>多人對戰</div>
        <div style={{ fontSize: 13, color: 'rgba(180,200,255,.5)', marginTop: 5 }}>輪流答題，比比誰的防詐能力最強！</div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'rgba(140,180,255,.55)', letterSpacing: 1, marginBottom: 9 }}>玩家人數</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[2, 3, 4].map(n => (
            <button key={n} onClick={() => setCount(n)} style={{
              flex: 1, padding: '12px 0', borderRadius: 11,
              background: count === n ? 'rgba(91,141,238,.28)' : 'rgba(255,255,255,.05)',
              border: `1px solid ${count === n ? 'rgba(91,141,238,.7)' : 'rgba(255,255,255,.1)'}`,
              color: count === n ? '#c8dbff' : 'rgba(180,200,255,.4)',
              fontSize: 20, fontWeight: 700, cursor: 'pointer',
              transition: 'all .15s',
            }}>{n}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 26 }}>
        <div style={{ fontSize: 13, color: 'rgba(140,180,255,.55)', letterSpacing: 1, marginBottom: 9 }}>參賽玩家</div>
        {previewNames.map((name, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 14px', borderRadius: 10, marginBottom: 8,
            background: 'rgba(255,255,255,.04)',
            border: `1px solid ${COLORS[i]}33`,
          }}>
            <AvatarBubble avatar={getAvatar(i)} color={COLORS[i]} index={i} size={32} />
            <span style={{ color: '#e0eaff', fontSize: 16, fontWeight: 500 }}>{name}</span>
          </div>
        ))}
      </div>

      <button onClick={handleStart} style={{
        width: '100%', padding: 15, borderRadius: 12,
        background: 'rgba(91,141,238,.22)', border: '1px solid rgba(91,141,238,.6)',
        color: '#c8dbff', fontSize: 16, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'Noto Sans TC,sans-serif', letterSpacing: 1,
      }}>
        🚀 開始對戰
      </button>
    </div>
  )
}

const backBtn = { background: 'none', border: 'none', color: 'rgba(180,200,255,.55)', fontSize: 13, cursor: 'pointer', padding: '0 0 14px', fontFamily: 'Noto Sans TC,sans-serif' }
