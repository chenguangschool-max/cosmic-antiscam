const TIPS = [
  '這是一款訓練你識破詐騙的遊戲。',
  '每題會出現一則訊息，你來判斷：正常，還是詐騙？',
  '在時間結束前點選答案，答對得金幣和經驗值。',
  '答題後會顯示解說，幫你了解詐騙手法。',
  '累積經驗值可以升等，解鎖圖鑑裡的詐騙怪獸。',
  '金幣可以在商店買道具，例如加時、跳題、防護盾。',
  '圖鑑收錄 30 種詐騙手法，解鎖後可查看辨識與應對方式。',
]

const REMINDS = [
  '要求立即轉帳、中獎要先繳費，都是詐騙！',
  '銀行和政府不會用簡訊要你提供帳號或密碼。',
  '親友突然換號借錢 → 用舊號碼確認。',
  '遇到可疑訊息，撥打 165 反詐騙專線。',
]

export default function Instructions({ onDone, isRevisit }) {
  return (
    <div style={{ padding:'20px 18px 0', position:'relative', zIndex:2, minHeight:'100vh', display:'flex', flexDirection:'column' }}>

      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ fontSize:46, marginBottom:8 }}>🛸</div>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:19, fontWeight:900, color:'#fff', letterSpacing:2 }}>
          宇宙防詐任務
        </div>
        <div style={{ fontSize:15, color:'rgba(180,200,255,.45)', marginTop:3 }}>使用說明</div>
      </div>

      <div style={{ flex:1, overflowY:'auto', paddingBottom:16, display:'flex', flexDirection:'column', gap:14 }}>

        {/* 使用說明 */}
        <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(91,141,238,.12)', border:'1px solid rgba(91,141,238,.28)' }}>
          <div style={{ fontSize:15, fontWeight:700, color:'#a8c4ff', letterSpacing:1, marginBottom:12 }}>📋 使用說明</div>
          {TIPS.map((tip, i) => (
            <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
              <div style={{
                width:24, height:24, borderRadius:'50%', flexShrink:0,
                background:'rgba(91,141,238,.25)', border:'1px solid rgba(91,141,238,.45)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:12, fontWeight:700, color:'#a8c4ff',
              }}>{i + 1}</div>
              <div style={{ fontSize:15, color:'rgba(210,225,255,.9)', lineHeight:1.8, paddingTop:2 }}>{tip}</div>
            </div>
          ))}
        </div>

        {/* 防詐提醒 */}
        <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(255,80,80,.07)', border:'1px solid rgba(255,80,80,.25)' }}>
          <div style={{ fontSize:15, fontWeight:700, color:'#ff9e9e', letterSpacing:1, marginBottom:12 }}>🚨 防詐提醒</div>
          {REMINDS.map((text, i) => (
            <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:10 }}>
              <span style={{ color:'rgba(255,120,90,.8)', flexShrink:0, fontSize:16 }}>•</span>
              <div style={{ fontSize:15, color:'rgba(255,200,190,.9)', lineHeight:1.8 }}>{text}</div>
            </div>
          ))}
        </div>

      </div>

      <div style={{ padding:'16px 0 28px' }}>
        <button onClick={onDone} style={{
          width:'100%', padding:16, borderRadius:14,
          background:'linear-gradient(135deg,rgba(91,141,238,.35),rgba(167,139,250,.3))',
          border:'1px solid rgba(91,141,238,.6)',
          color:'#e0eaff', fontSize:17, fontWeight:700,
          cursor:'pointer', fontFamily:'Noto Sans TC,sans-serif', letterSpacing:1,
        }}>
          {isRevisit ? '← 返回主選單' : '我閱讀完了，開始任務 🚀'}
        </button>
      </div>
    </div>
  )
}
