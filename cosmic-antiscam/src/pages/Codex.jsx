import { useState } from 'react'
import { useGame } from '../GameContext'
import { useToast } from '../components/Toast'
import { CODEX_EXTRA } from '../data'

const starsH = n => '★'.repeat(n) + '☆'.repeat(5-n)
const tcls = t => ({ fraud:'tf', social:'ts', invest:'ti', cyber:'tc', mixed:'tx' }[t]||'tf')
const typeStyle = {
  tf: { bg:'rgba(255,80,80,.11)',  bc:'rgba(255,80,80,.23)',  col:'#ff9e9e' },
  ts: { bg:'rgba(150,100,255,.11)',bc:'rgba(150,100,255,.23)',col:'#c4b0ff' },
  ti: { bg:'rgba(255,180,50,.11)', bc:'rgba(255,180,50,.23)', col:'#ffda82' },
  tc: { bg:'rgba(50,180,255,.11)', bc:'rgba(50,180,255,.23)', col:'#82d4ff' },
  tx: { bg:'rgba(255,80,200,.11)', bc:'rgba(255,80,200,.23)', col:'#ff9ee8' },
}

const FILTERS = [
  {k:'all',l:'全部'},{k:'fraud',l:'假冒詐騙'},{k:'social',l:'社交陷阱'},
  {k:'invest',l:'投資詐騙'},{k:'cyber',l:'網路攻擊'},{k:'mixed',l:'複合詐騙'},
]

export default function Codex({ navigate }) {
  const { monsters, coins, level, spendCoins, unlockMonster, justUnlocked } = useGame()
  const showToast = useToast()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [lockSelected, setLockSelected] = useState(null)

  const list = filter === 'all' ? monsters : monsters.filter(m => m.type === filter)
  const unlocked = monsters.filter(m => m.unlocked).length

  const handleCoinUnlock = () => {
    if (!lockSelected || coins < lockSelected.cr) return
    spendCoins(lockSelected.cr)
    unlockMonster(lockSelected.id, true)
    showToast(`✅ 解鎖 ${lockSelected.emoji} ${lockSelected.name}！`)
    setLockSelected(null)
  }

  const ts = (t) => typeStyle[tcls(t)] || typeStyle.tf

  return (
    <div style={{ padding:18, position:'relative', zIndex:2 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
        <button style={iconBtn} onClick={() => navigate('menu')}>← 主選單</button>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:13, fontWeight:700, color:'#fff', marginLeft:8 }}>📖 圖鑑</div>
        <div style={{ marginLeft:'auto', fontSize:10, color:'rgba(140,180,255,.48)' }}>{unlocked}/30</div>
      </div>

      {/* filters */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
        {FILTERS.map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)} style={{
            padding:'4px 12px', borderRadius:20, fontSize:11, cursor:'pointer',
            background: filter===f.k ? 'rgba(91,141,238,.2)':'transparent',
            border: `1px solid ${filter===f.k ? 'rgba(91,141,238,.48)':'rgba(91,141,238,.2)'}`,
            color: filter===f.k ? '#c8dbff':'rgba(180,200,255,.5)',
            fontFamily:'Noto Sans TC,sans-serif',
          }}>{f.l}</button>
        ))}
      </div>

      {/* grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(118px,1fr))', gap:9 }}>
        {list.map(m => {
          const isJust = justUnlocked.includes(m.id)
          const s = ts(m.type)
          return (
            <div key={m.id} onClick={() => m.unlocked ? setSelected(m) : setLockSelected(m)} style={{
              borderRadius:12, border: isJust ? '1px solid rgba(255,210,50,.5)' : '1px solid rgba(91,141,238,.16)',
              background: isJust ? 'rgba(255,210,50,.04)':'rgba(255,255,255,.04)',
              padding:'13px 10px', textAlign:'center', cursor:'pointer', position:'relative', overflow:'hidden',
              boxShadow: m.stars===5 ? '0 0 9px rgba(255,210,50,.18)' : m.stars===4 ? '0 0 7px rgba(150,100,255,.13)':'',
              animation: isJust ? 'pop .5s ease':'',
            }}>
              {isJust && <div style={{ position:'absolute', top:5, left:5, background:'rgba(50,200,150,.14)', border:'1px solid rgba(50,200,150,.32)', color:'#7ee8c0', fontSize:8, padding:'1px 5px', borderRadius:20 }}>NEW</div>}
              {!m.unlocked && <div style={{ position:'absolute', top:5, right:5, fontSize:12, opacity:.45 }}>🔒</div>}
              <div style={{ fontSize:28, marginBottom:5 }}>{m.unlocked ? m.emoji : '❓'}</div>
              <div style={{ fontSize:10, fontWeight:500, color:'#e0eaff', marginBottom:2, lineHeight:1.4 }}>
                {m.unlocked ? m.name : m.code}
              </div>
              <div style={{ fontSize:9, padding:'1px 6px', borderRadius:20, display:'inline-block', marginBottom:3, background:s.bg, border:`1px solid ${s.bc}`, color:s.col }}>{m.tl}</div>
              {m.unlocked && <div style={{ fontSize:9, color:'var(--gold)' }}>{starsH(m.stars)}</div>}
              {!m.unlocked && (
                <div style={{ position:'absolute', inset:0, background:'rgba(3,8,18,.52)', borderRadius:12, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3 }}>
                  <div style={{ fontSize:14, opacity:.5 }}>🔒</div>
                  <div style={{ fontSize:8, color:'rgba(140,180,255,.48)', textAlign:'center', padding:'0 3px', lineHeight:1.4 }}>Lv.{m.lv} 或 🪙{m.cr}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Detail overlay */}
      {selected && (() => {
        const extra = CODEX_EXTRA[selected.id]
        return (
          <div style={overlayBg} onClick={() => setSelected(null)}>
            <div style={{ ...overlayCard, maxHeight:'88vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
              <button style={closeBtn} onClick={() => setSelected(null)}>✕</button>
              <div style={{ fontSize:48, marginBottom:4 }}>{selected.emoji}</div>
              <div style={{ fontSize:13, color:'var(--gold)', marginBottom:4, letterSpacing:2 }}>{starsH(selected.stars)}</div>
              <div style={{ fontSize:16, fontWeight:700, color:'#e0eaff', marginBottom:2 }}>{selected.name}</div>
              <div style={{ fontSize:9, color:'rgba(140,180,255,.38)', fontFamily:'Orbitron,monospace', marginBottom:6 }}>{selected.code}</div>
              <div style={{ ...typeTag(ts(selected.type)), marginBottom:12 }}>{selected.tl}</div>

              {/* 介紹 */}
              <div style={{ textAlign:'left', marginBottom:9, background:'rgba(255,255,255,.03)', border:'1px solid rgba(91,141,238,.15)', borderRadius:8, padding:'9px 12px' }}>
                <div style={secLabel}>👾 怪物介紹</div>
                <div style={{ ...secVal, lineHeight:1.75 }}>{extra?.detail || selected.desc}</div>
              </div>

              {/* 詐騙警示 */}
              {extra?.flags?.length > 0 && (
                <div style={{ textAlign:'left', marginBottom:9, background:'rgba(255,90,70,.06)', border:'1px solid rgba(255,90,70,.2)', borderRadius:8, padding:'9px 12px' }}>
                  <div style={{ ...secLabel, color:'rgba(255,150,120,.7)', marginBottom:6 }}>🚩 辨識此怪物的關鍵</div>
                  {extra.flags.map((f, i) => (
                    <div key={i} style={{ display:'flex', gap:6, fontSize:11, color:'rgba(255,185,165,.85)', lineHeight:1.65, marginBottom:3 }}>
                      <span style={{ color:'rgba(255,120,90,.6)', flexShrink:0 }}>•</span>{f}
                    </div>
                  ))}
                </div>
              )}

              {/* 識破方式 */}
              <div style={{ textAlign:'left', marginBottom:9, background:'rgba(50,200,150,.06)', border:'1px solid rgba(50,200,150,.2)', borderRadius:8, padding:'9px 12px' }}>
                <div style={{ ...secLabel, color:'rgba(100,220,170,.65)', marginBottom:5 }}>✅ 識破方式</div>
                <div style={{ fontSize:11, color:'rgba(165,235,200,.85)', lineHeight:1.75 }}>{extra?.action || selected.defeat}</div>
              </div>

              {/* 底部資訊 */}
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                <div style={{ flex:1, textAlign:'center', background:'rgba(91,141,238,.06)', border:'1px solid rgba(91,141,238,.15)', borderRadius:8, padding:'6px 0', fontSize:10, color:'rgba(140,180,255,.6)' }}>
                  解鎖等級 <strong style={{ color:'#c8dbff' }}>Lv.{selected.lv}</strong>
                </div>
                <div style={{ flex:1, textAlign:'center', background:'rgba(91,141,238,.06)', border:'1px solid rgba(91,141,238,.15)', borderRadius:8, padding:'6px 0', fontSize:10, color:'rgba(140,180,255,.6)' }}>
                  難度 <span style={{ color:'var(--gold)' }}>{starsH(selected.stars)}</span>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, background:'rgba(255,210,50,.06)', border:'1px solid rgba(255,210,50,.2)', borderRadius:8, padding:'6px 12px', color:'var(--gold)', fontSize:11 }}>
                🪙 首次解鎖：+{selected.reward} 金幣
              </div>
            </div>
          </div>
        )
      })()}

      {/* Lock detail overlay */}
      {lockSelected && (
        <div style={overlayBg} onClick={() => setLockSelected(null)}>
          <div style={overlayCard} onClick={e => e.stopPropagation()}>
            <button style={closeBtn} onClick={() => setLockSelected(null)}>✕</button>
            <div style={{ fontSize:44, marginBottom:8 }}>❓</div>
            <div style={{ fontSize:12, color:'rgba(140,180,255,.55)', fontFamily:'Orbitron,monospace', marginBottom:5 }}>神秘訊號 {lockSelected.code}</div>
            <div style={{ fontSize:13, color:'rgba(180,200,255,.5)', marginBottom:12 }}>神秘訊號尚未解碼</div>
            <div style={{ textAlign:'left', marginBottom:10 }}>
              <div style={secLabel}>解鎖條件</div>
              <div style={{ ...secVal, marginBottom:5 }}>⭐ 等級解鎖（免費）：達到 <strong>Lv.{lockSelected.lv}</strong>　目前 Lv.{level}</div>
              <div style={secVal}>🪙 金幣解鎖：花費 <strong>{lockSelected.cr} 金幣</strong>　目前 {coins} 金幣</div>
            </div>
            <div style={{ background:'rgba(91,141,238,.07)', border:'1px solid rgba(91,141,238,.2)', borderRadius:9, padding:'9px 12px' }}>
              <div style={{ fontSize:10, color:'rgba(140,180,255,.5)', marginBottom:6 }}>提前花金幣解鎖？</div>
              <div style={{ display:'flex', gap:7 }}>
                <button onClick={handleCoinUnlock} disabled={coins < lockSelected.cr} style={{
                  flex:1, padding:7, borderRadius:8, fontSize:11, cursor: coins>=lockSelected.cr?'pointer':'default',
                  background: coins>=lockSelected.cr ? 'rgba(91,141,238,.18)':'rgba(255,255,255,.03)',
                  border: `1px solid ${coins>=lockSelected.cr ? 'rgba(91,141,238,.42)':'rgba(255,255,255,.09)'}`,
                  color: coins>=lockSelected.cr ? '#c8dbff':'rgba(140,160,200,.35)',
                  fontFamily:'Noto Sans TC,sans-serif',
                }}>
                  {coins >= lockSelected.cr ? `🪙 花 ${lockSelected.cr} 金幣解鎖` : `金幣不足（差${lockSelected.cr-coins}枚）`}
                </button>
                <button onClick={() => setLockSelected(null)} style={{ flex:.55, padding:7, borderRadius:8, fontSize:11, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(180,200,255,.5)', cursor:'pointer', fontFamily:'Noto Sans TC,sans-serif' }}>取消</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const iconBtn = { background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.14)', borderRadius:20, padding:'5px 13px', color:'rgba(180,200,255,.7)', fontSize:12, cursor:'pointer' }
const overlayBg = { position:'fixed', inset:0, background:'rgba(3,8,18,.93)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }
const overlayCard = { background:'#0c1829', border:'1px solid rgba(91,141,238,.32)', borderRadius:16, padding:'22px 18px', width:'92%', maxWidth:305, position:'relative', textAlign:'center' }
const closeBtn = { position:'absolute', top:10, right:11, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.13)', borderRadius:'50%', width:23, height:23, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(180,200,255,.6)', fontSize:11, cursor:'pointer' }
const secLabel = { fontSize:9, color:'rgba(140,180,255,.44)', letterSpacing:.5, marginBottom:2 }
const secVal = { fontSize:11, color:'#c8dbff', lineHeight:1.6 }
const typeTag = (s) => ({ display:'inline-block', fontSize:9, padding:'2px 9px', borderRadius:20, background:s.bg, border:`1px solid ${s.bc}`, color:s.col })
