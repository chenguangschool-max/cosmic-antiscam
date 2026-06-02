import { useGame } from '../GameContext'

const starsH = n => '★'.repeat(n) + '☆'.repeat(5-n)

export default function Result({ result, navigate }) {
  const { monsters, justUnlocked, level } = useGame()
  const { score=0, quizCoins=0, quizXp=0 } = result || {}
  const pct = score/10
  let planet, title, msg
  if (pct>=.9) { planet='🏆'; title='宇宙防詐英雄！'; msg='幾乎完美，你已掌握所有詐騙手法！' }
  else if (pct>=.7) { planet='⭐'; title='防詐高手'; msg='表現優秀，繼續鍛鍊判斷力！' }
  else if (pct>=.5) { planet='🛸'; title='星際學員'; msg='還有進步空間，多練習就能提升！' }
  else { planet='🌑'; title='需要加強'; msg='詐騙很狡猾，再來一次！' }

  const newlyUnlocked = monsters.filter(m => justUnlocked.includes(m.id))

  return (
    <div style={{ padding:18, position:'relative', zIndex:2, textAlign:'center' }}>
      <div style={{ fontSize:56, marginBottom:8 }}>{planet}</div>
      <div style={{ fontFamily:'Orbitron,monospace', fontSize:18, fontWeight:700, color:'#fff', marginBottom:5 }}>{title}</div>
      <div style={{ fontSize:13, color:'rgba(180,200,255,.72)', marginBottom:8 }}>答對 {score} / 10 題　{msg}</div>
      <div style={{ fontSize:20, fontWeight:700, color:'var(--gold)', marginBottom:6 }}>🪙 +{quizCoins} 防詐金幣</div>
      <div style={{ fontSize:13, color:'rgba(150,130,255,.8)', marginBottom:18 }}>✦ +{quizXp} XP　目前 Lv.{level}</div>

      {newlyUnlocked.length > 0 && (
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:12, color:'rgba(140,180,255,.5)', marginBottom:8 }}>🎉 本局解鎖的怪物</div>
          {newlyUnlocked.map((m,i) => (
            <div key={m.id} style={{
              display:'flex', alignItems:'center', gap:12,
              background:'rgba(255,210,50,.05)', border:'1px solid rgba(255,210,50,.25)',
              borderRadius:12, padding:'12px 14px', marginBottom:8,
              animation:`pop .45s ${i*.15}s ease both`,
            }}>
              <span style={{ fontSize:32 }}>{m.emoji}</span>
              <div style={{ flex:1, textAlign:'left' }}>
                <div style={{ fontSize:14, fontWeight:600, color:'#e0eaff' }}>{m.name}</div>
                <div style={{ fontSize:11, color:'var(--gold)' }}>{starsH(m.stars)}</div>
              </div>
              <div style={{ background:'rgba(255,210,50,.13)', border:'1px solid rgba(255,210,50,.35)', color:'var(--gold)', fontSize:10, padding:'2px 9px', borderRadius:20 }}>NEW</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:8, maxWidth:260, margin:'0 auto' }}>
        <button style={btnMain} onClick={() => navigate('modeSelect')}>再玩一次 🚀</button>
        <button style={btnSub} onClick={() => navigate('codex')}>查看圖鑑 📖</button>
        <button style={btnSub} onClick={() => navigate('menu')}>回主選單</button>
      </div>
    </div>
  )
}

const btnMain = { padding:11, borderRadius:11, fontSize:13, cursor:'pointer', fontFamily:'Noto Sans TC,sans-serif', background:'rgba(91,141,238,.18)', border:'1px solid rgba(91,141,238,.48)', color:'#c8dbff' }
const btnSub  = { padding:11, borderRadius:11, fontSize:13, cursor:'pointer', fontFamily:'Noto Sans TC,sans-serif', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(180,200,255,.6)' }
