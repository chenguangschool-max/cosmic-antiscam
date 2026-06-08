const starsH = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)

export default function UnlockOverlay({ monster, isCoin, onClose }) {
  if (!monster) return null
  const m = monster

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(3,8,18,.95)',
      zIndex:70, display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div style={{
        background:'#0c1829', border:'1px solid rgba(255,210,50,.38)',
        borderRadius:17, padding:'26px 22px', width:'90%', maxWidth:290,
        textAlign:'center', boxShadow:'0 0 28px rgba(255,210,50,.07)',
      }}>
        <div style={{ fontSize:54, marginBottom:7, animation:'bounce 1s ease infinite' }}>{m.emoji}</div>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:11, color:'rgba(255,210,50,.75)', letterSpacing:1, marginBottom:5 }}>✦ 怪物解鎖 ✦</div>
        <div style={{ fontSize:17, fontWeight:700, color:'#e0eaff', marginBottom:3 }}>{m.name}</div>
        <div style={{ fontSize:15, color:'var(--gold)', marginBottom:7, letterSpacing:2 }}>{starsH(m.stars)}</div>
        <div style={{ fontSize:13, color:'rgba(200,220,255,.88)', lineHeight:1.7, marginBottom:12 }}>{m.desc}</div>
        <div style={{ fontSize:19, fontWeight:700, color:'var(--gold)', marginBottom:14 }}>
          {isCoin ? '已解鎖！' : `🪙 +${m.reward} 金幣獎勵`}
        </div>
        <button onClick={onClose} style={{
          width:'100%', padding:10, background:'rgba(255,210,50,.13)',
          border:'1px solid rgba(255,210,50,.42)', borderRadius:10,
          color:'var(--gold)', fontSize:13, cursor:'pointer', fontFamily:'Noto Sans TC,sans-serif',
        }}>
          收下獎勵！
        </button>
      </div>
    </div>
  )
}
