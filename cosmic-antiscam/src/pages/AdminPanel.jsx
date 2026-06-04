import { useState } from 'react'

const SERVER = 'https://cosmic-antiscam-production.up.railway.app'
const ADMIN_SECRET = 'cosmic888'

export default function AdminPanel({ gameOpen, onToggle, onReset, toggling, resetting, playerCount, version }) {
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)

  const handleBroadcast = async () => {
    if (!msg.trim()) return
    setSending(true)
    try {
      await fetch(`${SERVER}/api/admin/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: ADMIN_SECRET, message: msg.trim() }),
      })
      setMsg('')
    } catch {}
    setSending(false)
  }

  const handleClear = async () => {
    setSending(true)
    try {
      await fetch(`${SERVER}/api/admin/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: ADMIN_SECRET, message: '' }),
      })
    } catch {}
    setSending(false)
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 999,
      background: '#0c1829', border: '1px solid rgba(91,141,238,.4)',
      borderRadius: 16, padding: 18, minWidth: 220,
      boxShadow: '0 8px 32px rgba(0,0,0,.6)',
    }}>
      <div style={{ fontSize: 13, color: 'rgba(140,180,255,.6)', fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>
        ⚙️ 管理員控制台
      </div>

      {/* 狀態列 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {/* 開關燈 */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 10px', borderRadius: 8,
          background: gameOpen ? 'rgba(50,200,120,.1)' : 'rgba(255,80,80,.1)',
          border: `1px solid ${gameOpen ? 'rgba(50,200,120,.3)' : 'rgba(255,80,80,.3)'}`,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: gameOpen ? '#34d399' : '#ff6b6b',
            boxShadow: `0 0 6px ${gameOpen ? '#34d399' : '#ff6b6b'}`,
          }} />
          <span style={{ fontSize: 12, color: gameOpen ? '#7ee8c5' : '#ffaaaa', fontWeight: 600 }}>
            {gameOpen ? '進行中' : '已關閉'}
          </span>
        </div>
        {/* 人數 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '7px 10px', borderRadius: 8,
          background: 'rgba(91,141,238,.08)', border: '1px solid rgba(91,141,238,.22)',
        }}>
          <span style={{ fontSize: 12 }}>👥</span>
          <span style={{ fontSize: 13, color: '#a8c4ff', fontWeight: 700 }}>{playerCount ?? 0}</span>
        </div>
      </div>

      {/* 開關按鈕 */}
      <button onClick={onToggle} disabled={toggling} style={{
        width: '100%', padding: '10px 0', borderRadius: 10, marginBottom: 8,
        background: gameOpen ? 'rgba(255,80,80,.2)' : 'rgba(50,200,120,.2)',
        border: `1px solid ${gameOpen ? 'rgba(255,80,80,.5)' : 'rgba(50,200,120,.5)'}`,
        color: gameOpen ? '#ffaaaa' : '#7ee8c5',
        fontSize: 13, fontWeight: 700, cursor: toggling ? 'wait' : 'pointer',
        fontFamily: 'Noto Sans TC,sans-serif',
      }}>
        {toggling ? '…' : gameOpen ? '🔒 關閉遊戲' : '🔓 開啟遊戲'}
      </button>

      {/* 重置按鈕 */}
      <button onClick={() => {
        if (window.confirm('確定重置？所有人將重新看使用說明、設定暱稱、金幣歸零。')) onReset()
      }} disabled={resetting} style={{
        width: '100%', padding: '10px 0', borderRadius: 10, marginBottom: 14,
        background: 'rgba(255,180,50,.1)', border: '1px solid rgba(255,180,50,.3)',
        color: '#ffd27a', fontSize: 13, fontWeight: 700,
        cursor: resetting ? 'wait' : 'pointer', fontFamily: 'Noto Sans TC,sans-serif',
      }}>
        {resetting ? '重置中…' : '🔄 重置所有人'}
      </button>

      {/* 廣播公告 */}
      <div style={{ borderTop: '1px solid rgba(91,141,238,.2)', paddingTop: 12 }}>
        <div style={{ fontSize: 11, color: 'rgba(140,180,255,.5)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
          📢 廣播公告
        </div>
        <textarea
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="輸入公告內容…"
          rows={2}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(91,141,238,.07)', border: '1px solid rgba(91,141,238,.25)',
            borderRadius: 8, padding: '7px 10px', color: '#c8dbff',
            fontSize: 13, fontFamily: 'Noto Sans TC,sans-serif', resize: 'none',
            outline: 'none', marginBottom: 6,
          }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={handleBroadcast} disabled={sending || !msg.trim()} style={{
            flex: 1, padding: '8px 0', borderRadius: 8,
            background: 'rgba(91,141,238,.2)', border: '1px solid rgba(91,141,238,.4)',
            color: '#a8c4ff', fontSize: 12, fontWeight: 700,
            cursor: (sending || !msg.trim()) ? 'default' : 'pointer',
            fontFamily: 'Noto Sans TC,sans-serif', opacity: msg.trim() ? 1 : 0.5,
          }}>
            {sending ? '…' : '發送'}
          </button>
          <button onClick={handleClear} disabled={sending} style={{
            padding: '8px 12px', borderRadius: 8,
            background: 'rgba(255,80,80,.1)', border: '1px solid rgba(255,80,80,.25)',
            color: '#ffaaaa', fontSize: 12, fontWeight: 700,
            cursor: sending ? 'default' : 'pointer',
            fontFamily: 'Noto Sans TC,sans-serif',
          }}>
            清除
          </button>
        </div>
      </div>
    </div>
  )
}
