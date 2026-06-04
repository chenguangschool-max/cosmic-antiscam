import { useState } from 'react'

export default function ProfileSetup({ onDone }) {
  const [name, setName] = useState('')
  const [err, setErr] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) return setErr('請輸入你的暱稱')
    localStorage.setItem('playerName', name.trim())
    onDone(name.trim())
  }

  return (
    <div style={{ padding: '32px 20px', position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🧑‍🚀</div>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 19, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>
          建立你的檔案
        </div>
        <div style={{ fontSize: 14, color: 'rgba(180,200,255,.5)', marginTop: 6 }}>
          設定你的防詐宇宙暱稱
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{
          padding: '20px', borderRadius: 16,
          background: 'rgba(91,141,238,.06)',
          border: '1px solid rgba(91,141,238,.2)',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 15, color: 'rgba(140,180,255,.7)', marginBottom: 12, fontWeight: 600 }}>
            👤 你的暱稱
          </div>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setErr('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder='輸入暱稱（最多 10 字）'
            maxLength={10}
            autoFocus
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,.07)',
              border: `1px solid ${err ? 'rgba(255,80,80,.5)' : 'rgba(91,141,238,.3)'}`,
              color: '#e0eaff', fontSize: 18, fontFamily: 'Noto Sans TC,sans-serif',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          {err && <div style={{ fontSize: 13, color: '#ff9999', marginTop: 8 }}>{err}</div>}
          <div style={{ fontSize: 13, color: 'rgba(140,180,255,.4)', marginTop: 10 }}>
            此暱稱將顯示於連線對戰排行榜
          </div>
        </div>

        <div style={{
          padding: '16px', borderRadius: 12,
          background: 'rgba(255,220,80,.05)',
          border: '1px solid rgba(255,220,80,.18)',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, color: 'rgba(255,220,80,.6)', fontWeight: 600, marginBottom: 8 }}>💡 小提醒</div>
          <div style={{ fontSize: 14, color: 'rgba(255,240,180,.75)', lineHeight: 1.8 }}>
            暱稱可以隨時在設定中更改，現在先設一個好記的名字吧！
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        style={{
          width: '100%', padding: 16, borderRadius: 14,
          background: 'linear-gradient(135deg,rgba(91,141,238,.35),rgba(167,139,250,.3))',
          border: '1px solid rgba(91,141,238,.6)',
          color: '#e0eaff', fontSize: 17, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif', letterSpacing: 1,
        }}
      >
        進入宇宙 🚀
      </button>
    </div>
  )
}
