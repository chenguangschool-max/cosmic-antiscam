import { useState } from 'react'
import { useGame } from '../GameContext'

const TIPS = [
  { icon:'🏦', text:'銀行不會用簡訊叫你點連結輸入密碼，收到就直接刪除。' },
  { icon:'👮', text:'警察和檢察官絕對不會電話要求你轉帳，掛斷後撥 110 確認。' },
  { icon:'🎁', text:'沒參加的抽獎卻中獎，又要先繳費才能領，100% 是詐騙。' },
  { icon:'💸', text:'任何「保證獲利」的投資都是詐騙，投資一定有風險。' },
  { icon:'👴', text:'孫子或家人緊急借錢，先掛斷用原本的號碼打回去確認。' },
  { icon:'🔗', text:'不要點簡訊或 LINE 裡來路不明的連結，直接到官方網站查詢。' },
  { icon:'🏥', text:'醫院急診不會要求家屬先匯押金到私人帳戶才能開刀。' },
  { icon:'📞', text:'不確定真假，就撥 165 反詐騙專線，24 小時都有人接聽。' },
  { icon:'🔐', text:'驗證碼就是鑰匙，任何人要求驗證碼都不能給，包括自稱官方的人。' },
  { icon:'💡', text:'被催促「馬上決定」「不然來不及」，就是詐騙在逼你，先停下來。' },
]

const tip = TIPS[Math.floor(Math.random() * TIPS.length)]

function SettingsModal({ onClose }) {
  const [name, setName] = useState(localStorage.getItem('playerName') || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!name.trim()) return
    localStorage.setItem('playerName', name.trim())
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 800)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(5,13,26,.85)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: 400,
        background: '#0c1829', border: '1px solid rgba(91,141,238,.35)',
        borderRadius: 18, padding: 24,
        animation: 'pop .2s ease',
      }} onClick={e => e.stopPropagation()}>

        <div style={{ fontSize: 18, fontWeight: 700, color: '#c8dbff', marginBottom: 20 }}>⚙️ 設定</div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, color: 'rgba(140,180,255,.6)', marginBottom: 8 }}>暱稱</div>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setSaved(false) }}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            maxLength={10}
            autoFocus
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,.07)', border: '1px solid rgba(91,141,238,.3)',
              color: '#e0eaff', fontSize: 17, fontFamily: 'Noto Sans TC,sans-serif',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSave} style={{
            flex: 1, padding: '12px 0', borderRadius: 10, fontFamily: 'Noto Sans TC,sans-serif',
            background: saved ? 'rgba(50,200,150,.22)' : 'rgba(91,141,238,.22)',
            border: `1px solid ${saved ? 'rgba(50,200,150,.6)' : 'rgba(91,141,238,.6)'}`,
            color: saved ? '#7ee8c5' : '#c8dbff',
            fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
          }}>
            {saved ? '✅ 已儲存' : '儲存'}
          </button>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px 0', borderRadius: 10, fontFamily: 'Noto Sans TC,sans-serif',
            background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)',
            color: 'rgba(180,200,255,.6)', fontSize: 15, cursor: 'pointer',
          }}>
            取消
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MainMenu({ navigate }) {
  const { coins, level, getXpProgress, monsters, resetGame } = useGame()
  const { cur, pct, next } = getXpProgress()
  const unlocked = monsters.filter(m => m.unlocked).length
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div style={{ padding:18, position:'relative', zIndex:2, minHeight:'100vh' }}>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
        <button style={iconBtn} onClick={() => setShowSettings(true)}>⚙️ 設定</button>
        <div style={coinBadge}>🪙 {coins}</div>
        <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
          <button style={iconBtn} onClick={() => navigate('instructions')}>📋 使用說明</button>
          <button style={iconBtn} onClick={() => navigate('shop')}>🛒 商店</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ textAlign:'center', margin:'6px 0 14px', position:'relative', zIndex:2 }}>
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
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:20, fontWeight:900, color:'#fff', letterSpacing:2, textShadow:'0 0 18px rgba(91,141,238,.7)' }}>
          宇宙防詐任務
        </div>
        <div style={{ fontSize:14, color:'rgba(180,200,255,.45)', marginTop:3 }}>COSMIC ANTI-SCAM MISSION</div>
        {/* 等級與XP */}
        <div style={{ maxWidth:300, margin:'10px auto 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'rgba(140,180,255,.45)', marginBottom:3 }}>
            <span>Lv.{level}　XP {cur}</span><span>Lv.{level+1} 需 {next}</span>
          </div>
          <div style={{ height:4, background:'rgba(255,255,255,.07)', borderRadius:4, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#a78bfa,#5b8dee)', borderRadius:4, transition:'width .6s' }} />
          </div>
        </div>
      </div>

      {/* 防詐小提醒 */}
      <div style={{
        maxWidth:440, margin:'0 auto 14px',
        padding:'13px 16px', borderRadius:14,
        background:'rgba(255,220,80,.07)',
        border:'1px solid rgba(255,220,80,.28)',
        display:'flex', alignItems:'flex-start', gap:12,
      }}>
        <span style={{ fontSize:26, flexShrink:0, lineHeight:1.3 }}>{tip.icon}</span>
        <div>
          <div style={{ fontSize:12, color:'rgba(255,220,80,.6)', fontWeight:700, letterSpacing:1, marginBottom:5 }}>💡 防詐小提醒</div>
          <div style={{ fontSize:16, color:'rgba(255,240,180,.92)', lineHeight:1.75 }}>{tip.text}</div>
        </div>
      </div>

      {/* Menu grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, maxWidth:440, margin:'0 auto' }}>
        <button style={{ ...menuBtn, ...btnStart, gridColumn:'1/-1' }} onClick={() => navigate('modeSelect')}>
          <span style={{ fontSize:22 }}>🚀</span>
          <span style={{ fontSize:18, letterSpacing:1 }}>▶ 開始遊戲</span>
        </button>
        <button style={{ ...menuBtn, background:'rgba(80,200,240,.07)', borderColor:'rgba(80,200,240,.28)', color:'#94e8ff' }} onClick={() => navigate('codex')}>
          <span style={{ fontSize:22 }}>📖</span>
          <div><div style={{ fontSize:16, fontWeight:500 }}>圖鑑</div><div style={{ fontSize:13, opacity:.6 }}>收集 {unlocked}/30</div></div>
        </button>
        <button style={{ ...menuBtn, background:'rgba(255,180,50,.09)', borderColor:'rgba(255,180,50,.28)', color:'#ffd27a' }} onClick={() => navigate('shop')}>
          <span style={{ fontSize:22 }}>🛒</span>
          <div><div style={{ fontSize:16, fontWeight:500 }}>商店</div><div style={{ fontSize:13, opacity:.6 }}>購買道具</div></div>
        </button>
        <button style={{ ...menuBtn, background:'rgba(80,200,120,.09)', borderColor:'rgba(80,200,120,.32)', color:'#7ee8a0', gridColumn:'1/-1' }} onClick={() => navigate('onlineLobby')}>
          <span style={{ fontSize:22 }}>🌐</span>
          <div><div style={{ fontSize:16, fontWeight:500 }}>連線對戰</div><div style={{ fontSize:13, opacity:.6 }}>即時同步</div></div>
        </button>
      </div>

      {/* 重置存檔 */}
      <div style={{ textAlign:'center', marginTop:20 }}>
        <button onClick={() => { if(window.confirm('確定要歸零所有存檔嗎？')) resetGame() }} style={{
          background:'none', border:'none', color:'rgba(180,200,255,.2)',
          fontSize:14, cursor:'pointer', fontFamily:'Noto Sans TC,sans-serif',
        }}>重置存檔</button>
      </div>
    </div>
  )
}

const coinBadge = { display:'flex', alignItems:'center', gap:5, background:'rgba(255,210,50,.1)', border:'1px solid rgba(255,210,50,.32)', borderRadius:20, padding:'5px 14px', color:'var(--gold)', fontSize:15, fontWeight:500 }
const iconBtn = { background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.14)', borderRadius:20, padding:'7px 15px', color:'rgba(180,200,255,.85)', fontSize:14, cursor:'pointer', fontFamily:'Noto Sans TC,sans-serif' }
const menuBtn = { display:'flex', alignItems:'center', gap:10, padding:'14px 15px', borderRadius:12, border:'1px solid', cursor:'pointer', textAlign:'left', fontFamily:'Noto Sans TC,sans-serif' }
const btnStart = { background:'rgba(91,141,238,.17)', borderColor:'rgba(91,141,238,.52)', color:'#c8dbff', justifyContent:'center', padding:'17px' }
