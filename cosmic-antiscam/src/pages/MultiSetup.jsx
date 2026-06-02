import { useState } from 'react'

const COLORS = ['#5b8dee', '#a78bfa', '#34d399', '#fb923c']

export default function MultiSetup({ navigate, onStart }) {
  const [count, setCount] = useState(2)
  const [names, setNames] = useState(['玩家1', '玩家2', '玩家3', '玩家4'])

  const handleStart = () => {
    const players = names.slice(0, count).map((n, i) => n.trim() || `玩家${i + 1}`)
    onStart(players)
  }

  return (
    <div style={{ padding: 18, position: 'relative', zIndex: 2 }}>
      <button onClick={() => navigate('menu')} style={backBtn}>← 返回</button>

      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>多人對戰</div>
        <div style={{ fontSize: 12, color: 'rgba(180,200,255,.5)', marginTop: 5 }}>輪流答題，比比誰的防詐能力最強！</div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: 'rgba(140,180,255,.55)', letterSpacing: 1, marginBottom: 9 }}>玩家人數</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[2, 3, 4].map(n => (
            <button key={n} onClick={() => setCount(n)} style={{
              flex: 1, padding: '11px 0', borderRadius: 11,
              background: count === n ? 'rgba(91,141,238,.28)' : 'rgba(255,255,255,.05)',
              border: `1px solid ${count === n ? 'rgba(91,141,238,.7)' : 'rgba(255,255,255,.1)'}`,
              color: count === n ? '#c8dbff' : 'rgba(180,200,255,.4)',
              fontSize: 18, fontWeight: 700, cursor: 'pointer',
              transition: 'all .15s',
            }}>{n}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 26 }}>
        <div style={{ fontSize: 11, color: 'rgba(140,180,255,.55)', letterSpacing: 1, marginBottom: 9 }}>玩家名稱</div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: COLORS[i], display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff',
            }}>{i + 1}</div>
            <input
              value={names[i]}
              onChange={e => setNames(prev => prev.map((n, j) => j === i ? e.target.value : n))}
              placeholder={`玩家${i + 1}`}
              maxLength={10}
              style={{
                flex: 1, padding: '9px 13px', borderRadius: 9,
                background: 'rgba(255,255,255,.06)', border: '1px solid rgba(91,141,238,.22)',
                color: '#e0eaff', fontSize: 13, fontFamily: 'Noto Sans TC,sans-serif', outline: 'none',
              }}
            />
          </div>
        ))}
      </div>

      <button onClick={handleStart} style={{
        width: '100%', padding: 14, borderRadius: 12,
        background: 'rgba(91,141,238,.22)', border: '1px solid rgba(91,141,238,.6)',
        color: '#c8dbff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'Noto Sans TC,sans-serif', letterSpacing: 1,
      }}>
        🚀 開始對戰
      </button>
    </div>
  )
}

const backBtn = { background: 'none', border: 'none', color: 'rgba(180,200,255,.55)', fontSize: 13, cursor: 'pointer', padding: '0 0 14px', fontFamily: 'Noto Sans TC,sans-serif' }
