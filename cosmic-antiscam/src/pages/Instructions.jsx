export default function Instructions({ onDone, isRevisit }) {
  return (
    <div style={{ padding:'20px 18px 0', position:'relative', zIndex:2, minHeight:'100vh', display:'flex', flexDirection:'column' }}>

      {/* 標題 */}
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ fontSize:38, marginBottom:8 }}>🛸</div>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:16, fontWeight:900, color:'#fff', letterSpacing:2 }}>
          宇宙防詐任務
        </div>
        <div style={{ fontSize:11, color:'rgba(180,200,255,.45)', marginTop:3 }}>使用說明</div>
      </div>

      {/* 內容 */}
      <div style={{ flex:1, overflowY:'auto', paddingBottom:16 }}>

        {/* 使用說明 */}
        <div style={{ marginBottom:14, padding:'14px 16px', borderRadius:12, background:'rgba(255,255,255,.03)', border:'1px solid rgba(91,141,238,.18)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#a8c4ff', letterSpacing:1, marginBottom:10 }}>📋 使用說明</div>
          <Step n="1" text="閱讀畫面上的星際通訊訊息" />
          <Step n="2" text="判斷這則訊息是「正常通知」還是「詐騙訊息」" />
          <Step n="3" text="在時間內點擊下方按鈕作答" />
          <Step n="4" text="作答後會顯示正確答案與說明" />
          <Step n="5" text="完成 10 題後查看成績" />
        </div>

        {/* 防詐小提醒 */}
        <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(255,80,80,.07)', border:'1px solid rgba(255,80,80,.25)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#ff9e9e', letterSpacing:1, marginBottom:10 }}>🚨 防詐小提醒</div>
          <Remind text="任何要求你「立即轉帳」的訊息，先停下來確認！" />
          <Remind text="正規機構不會要求你提供帳號密碼或動態驗證碼。" />
          <Remind text="收到中獎通知需要先繳費？一定是詐騙！" />
          <Remind text="不確定時撥打 165 反詐騙專線查證。" />
        </div>

      </div>

      {/* 確認按鈕 */}
      <div style={{ padding:'16px 0 28px' }}>
        <button onClick={onDone} style={{
          width:'100%', padding:15, borderRadius:14,
          background:'linear-gradient(135deg,rgba(91,141,238,.35),rgba(167,139,250,.3))',
          border:'1px solid rgba(91,141,238,.6)',
          color:'#e0eaff', fontSize:14, fontWeight:700,
          cursor:'pointer', fontFamily:'Noto Sans TC,sans-serif', letterSpacing:1,
        }}>
          {isRevisit ? '← 返回主選單' : '我閱讀完了，開始任務 🚀'}
        </button>
      </div>
    </div>
  )
}

function Step({ n, text }) {
  return (
    <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:8 }}>
      <div style={{
        width:20, height:20, borderRadius:'50%', flexShrink:0,
        background:'rgba(91,141,238,.25)', border:'1px solid rgba(91,141,238,.45)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:10, fontWeight:700, color:'#a8c4ff',
      }}>{n}</div>
      <div style={{ fontSize:12, color:'rgba(200,220,255,.8)', lineHeight:1.7 }}>{text}</div>
    </div>
  )
}

function Remind({ text }) {
  return (
    <div style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:7 }}>
      <span style={{ color:'rgba(255,120,90,.7)', flexShrink:0, fontSize:12 }}>•</span>
      <div style={{ fontSize:12, color:'rgba(255,200,190,.8)', lineHeight:1.7 }}>{text}</div>
    </div>
  )
}
