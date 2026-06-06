export default function Instructions({ onDone, isRevisit }) {
  return (
    <div style={{ padding:'20px 18px 0', position:'relative', zIndex:2, minHeight:'100vh', display:'flex', flexDirection:'column' }}>

      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{ fontSize:46, marginBottom:8 }}>🛸</div>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:19, fontWeight:900, color:'#fff', letterSpacing:2 }}>
          宇宙防詐任務
        </div>
        <div style={{ fontSize:15, color:'rgba(180,200,255,.45)', marginTop:3 }}>使用說明</div>
      </div>

      <div style={{ flex:1, overflowY:'auto', paddingBottom:16 }}>

        <Section color='rgba(91,141,238,.18)' border='rgba(91,141,238,.3)'>
          <SectionTitle>🎯 遊戲目的</SectionTitle>
          <p style={bodyText}>判斷訊息是「正常」還是「詐騙」，答對得金幣和經驗值，等級提升！</p>
          <p style={bodyText}>答題後會有解說，幫你認識各種詐騙手法。</p>
        </Section>

        <Section color='rgba(255,80,80,.07)' border='rgba(255,80,80,.25)'>
          <SectionTitle color='#ff9e9e'>🚨 防詐提醒</SectionTitle>
          <Remind text="要求立即轉帳 → 先打電話給家人確認" />
          <Remind text="銀行／政府不會簡訊要你提供帳密" />
          <Remind text="中獎還要先繳費 = 100% 詐騙" />
          <Remind text="親友突然換號借錢 → 用舊號碼確認" />
          <Remind text="不確定？撥 165 反詐騙專線" />
        </Section>

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

function Section({ children, color, border }) {
  return (
    <div style={{ marginBottom:14, padding:'14px 16px', borderRadius:12, background:color, border:`1px solid ${border}` }}>
      {children}
    </div>
  )
}

function SectionTitle({ children, color }) {
  return (
    <div style={{ fontSize:15, fontWeight:700, color: color || '#a8c4ff', letterSpacing:1, marginBottom:10 }}>
      {children}
    </div>
  )
}

function Remind({ text }) {
  return (
    <div style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:8 }}>
      <span style={{ color:'rgba(255,120,90,.8)', flexShrink:0, fontSize:16 }}>•</span>
      <div style={{ fontSize:16, color:'rgba(255,200,190,.85)', lineHeight:1.8 }}>{text}</div>
    </div>
  )
}

const bodyText = { fontSize:15, color:'rgba(200,220,255,.8)', lineHeight:1.8, marginBottom:8 }
