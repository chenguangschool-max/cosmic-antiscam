import { MODES } from '../data'
import { useGame } from '../GameContext'

export default function ModeSelect({ navigate, onModeSelect }) {
  const { monsters, level } = useGame()
  const nextLock = monsters.filter(m => !m.unlocked).sort((a,b) => a.lv - b.lv)[0]

  return (
    <div style={{ padding:18, position:'relative', zIndex:2 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        <button style={iconBtn} onClick={() => navigate('menu')}>← 返回</button>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:13, fontWeight:700, color:'#fff', marginLeft:8 }}>選擇模式</div>
      </div>

      {MODES.map(mode => (
        <div key={mode.id} style={modeCard} onClick={() => { onModeSelect(mode); navigate('quiz') }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5 }}>
            <span style={{ fontSize:26 }}>{mode.emoji}</span>
            <span style={{ fontSize:15, fontWeight:600, color:'#e0eaff' }}>{mode.name}</span>
          </div>
          <div style={{ fontSize:12, color:'rgba(140,180,255,.6)', lineHeight:1.6 }}>{mode.desc}</div>
          <div style={{ display:'flex', gap:5, marginTop:7, flexWrap:'wrap' }}>
            {mode.tags.map((t,i) => (
              <span key={t} style={{
                fontSize:9, padding:'2px 8px', borderRadius:20,
                background: i===1 ? 'rgba(255,80,80,.09)' : 'rgba(50,200,150,.12)',
                border: `1px solid ${i===1 ? 'rgba(255,80,80,.22)' : 'rgba(50,200,150,.28)'}`,
                color: i===1 ? '#ff9e9e' : '#7ee8c0',
              }}>{t}</span>
            ))}
          </div>
          {nextLock && (
            <div style={{ fontSize:10, color:'rgba(255,210,50,.55)', marginTop:6 }}>
              下一個解鎖：{nextLock.code}（Lv.{nextLock.lv}）
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const iconBtn = { background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.14)', borderRadius:20, padding:'5px 13px', color:'rgba(180,200,255,.7)', fontSize:12, cursor:'pointer' }
const modeCard = { background:'#0c1829', border:'1px solid rgba(91,141,238,.25)', borderRadius:15, padding:18, marginBottom:10, cursor:'pointer', position:'relative', zIndex:2 }
