import { useState } from 'react'
import { ITEMS } from '../data'
import { useGame } from '../GameContext'
import { useToast } from '../components/Toast'

const FILTERS = [{k:'all',l:'全部'},{k:'time',l:'時間'},{k:'hint',l:'提示'},{k:'shield',l:'防護'},{k:'special',l:'特殊'}]

export default function Shop({ navigate }) {
  const { coins, bag, buyItem } = useGame()
  const showToast = useToast()
  const [filter, setFilter] = useState('all')
  const [confirm, setConfirm] = useState(null)

  const list = filter==='all' ? ITEMS : ITEMS.filter(i => i.cat===filter)

  const handleBuy = () => {
    if (!confirm) return
    if (buyItem(confirm)) {
      showToast(`✅ ${confirm.emoji} ${confirm.name} 已入袋！`)
    } else {
      showToast('金幣不足！', true)
    }
    setConfirm(null)
  }

  const bagKeys = Object.keys(bag).filter(k => bag[k] > 0)

  return (
    <div style={{ padding:18, position:'relative', zIndex:2 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
        <button style={iconBtn} onClick={() => navigate('menu')}>← 主選單</button>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:13, fontWeight:700, color:'#fff', marginLeft:8 }}>🛒 商店</div>
        <div style={coinBadge}>🪙 {coins}</div>
      </div>

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

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:9, marginBottom:18 }}>
        {list.map(item => {
          const qty = bag[item.id]||0
          const canBuy = coins >= item.price
          return (
            <div key={item.id} style={{ borderRadius:12, border:'1px solid rgba(91,141,238,.16)', background:'rgba(255,255,255,.04)', padding:'13px 11px', textAlign:'center', position:'relative' }}>
              {item.hot && <div style={badge('rgba(255,80,80,.11)','rgba(255,80,80,.25)','#ff9e9e','6px','6px')}>熱門</div>}
              {item.isNew && <div style={badge('rgba(50,200,150,.14)','rgba(50,200,150,.32)','#7ee8c0','6px','6px')}>NEW</div>}
              {qty > 0 && <div style={{ position:'absolute', top:6, right:6, background:'rgba(255,210,50,.1)', border:'1px solid rgba(255,210,50,.25)', borderRadius:20, padding:'1px 6px', fontSize:8, color:'var(--gold)' }}>x{qty}</div>}
              <div style={{ fontSize:28, marginBottom:6 }}>{item.emoji}</div>
              <div style={{ fontSize:11, fontWeight:600, color:'#e0eaff', marginBottom:2 }}>{item.name}</div>
              <div style={{ fontSize:9, color:'rgba(140,180,255,.52)', lineHeight:1.5, marginBottom:6, minHeight:24 }}>{item.desc}</div>
              <div style={{ fontSize:9, color:'rgba(100,220,170,.72)', marginBottom:6 }}>✦ {item.effect}</div>
              <button onClick={() => canBuy && setConfirm(item)} style={{
                width:'100%', padding:'5px 0', borderRadius:7, fontSize:10, fontWeight:500,
                cursor: canBuy?'pointer':'default',
                background: canBuy?'rgba(91,141,238,.18)':'rgba(255,255,255,.03)',
                border: `1px solid ${canBuy?'rgba(91,141,238,.4)':'rgba(255,255,255,.09)'}`,
                color: canBuy?'#c8dbff':'rgba(140,160,200,.35)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:3,
                fontFamily:'Noto Sans TC,sans-serif',
              }}>
                🪙{item.price}{!canBuy?'（不足）':''}
              </button>
            </div>
          )
        })}
      </div>

      {/* Bag */}
      <div>
        <div style={{ fontSize:10, color:'rgba(140,180,255,.42)', marginBottom:7 }}>🎒 我的道具</div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {bagKeys.length === 0 && <div style={{ fontSize:10, color:'rgba(140,180,255,.32)' }}>尚未購買任何道具</div>}
          {bagKeys.map(k => {
            const item = ITEMS.find(i => i.id===k)
            if (!item) return null
            return (
              <div key={k} style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(255,255,255,.04)', border:'1px solid rgba(91,141,238,.16)', borderRadius:8, padding:'4px 10px', fontSize:10, color:'#c8dbff' }}>
                {item.emoji} {item.name} <span style={{ color:'rgba(140,180,255,.48)', fontSize:9 }}>x{bag[k]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Confirm overlay */}
      {confirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(3,8,18,.93)', zIndex:60, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={() => setConfirm(null)}>
          <div style={{ background:'#0c1829', border:'1px solid rgba(91,141,238,.32)', borderRadius:16, padding:'24px 20px', width:'88%', maxWidth:280, textAlign:'center' }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:40, marginBottom:7 }}>{confirm.emoji}</div>
            <div style={{ fontSize:15, fontWeight:600, color:'#e0eaff', marginBottom:4 }}>{confirm.name}</div>
            <div style={{ fontSize:11, color:'rgba(180,200,255,.58)', lineHeight:1.6, marginBottom:11 }}>{confirm.desc}</div>
            <div style={{ fontSize:18, fontWeight:700, color:'var(--gold)', marginBottom:14 }}>🪙 {confirm.price} 防詐金幣</div>
            <div style={{ display:'flex', gap:7 }}>
              <button onClick={() => setConfirm(null)} style={{ flex:1, padding:8, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.11)', borderRadius:8, color:'rgba(180,200,255,.52)', fontSize:11, cursor:'pointer', fontFamily:'Noto Sans TC,sans-serif' }}>取消</button>
              <button onClick={handleBuy} style={{ flex:1, padding:8, background:'rgba(91,141,238,.18)', border:'1px solid rgba(91,141,238,.45)', borderRadius:8, color:'#c8dbff', fontSize:11, cursor:'pointer', fontFamily:'Noto Sans TC,sans-serif' }}>確認購買</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const iconBtn = { background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.14)', borderRadius:20, padding:'5px 13px', color:'rgba(180,200,255,.7)', fontSize:12, cursor:'pointer' }
const coinBadge = { display:'flex', alignItems:'center', gap:5, background:'rgba(255,210,50,.1)', border:'1px solid rgba(255,210,50,.32)', borderRadius:20, padding:'4px 12px', color:'var(--gold)', fontSize:13, fontWeight:500, marginLeft:'auto' }
const badge = (bg,bc,col,top,left) => ({ position:'absolute', top, left, background:bg, border:`1px solid ${bc}`, color:col, fontSize:8, padding:'1px 5px', borderRadius:20 })
