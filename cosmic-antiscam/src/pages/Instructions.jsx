export default function Instructions({ onDone, isRevisit }) {
  const canProceed = true

  return (
    <div style={{ padding:'20px 18px 0', position:'relative', zIndex:2, minHeight:'100vh', display:'flex', flexDirection:'column' }}>

      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ fontSize:42, marginBottom:8 }}>🛸</div>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:19, fontWeight:900, color:'#fff', letterSpacing:2 }}>
          宇宙防詐任務
        </div>
        <div style={{ fontSize:15, color:'rgba(180,200,255,.45)', marginTop:3 }}>使用說明</div>
      </div>

      <div style={{ flex:1, overflowY:'auto', paddingBottom:16 }}>

        {/* 遊戲目的 */}
        <Section color='rgba(91,141,238,.18)' border='rgba(91,141,238,.3)'>
          <SectionTitle>🎯 遊戲目的</SectionTitle>
          <p style={bodyText}>判斷訊息是「正常」還是「詐騙」，答對得金幣和經驗值，等級提升！</p>
        </Section>

        {/* 如何作答 */}
        <Section color='rgba(91,141,238,.1)' border='rgba(91,141,238,.2)'>
          <SectionTitle>📋 如何作答</SectionTitle>
          <Step n="1" text="閱讀訊息" />
          <Step n="2" text="判斷：正常 or 詐騙？" />
          <Step n="3" text="時間內點選答案" />
          <Step n="4" text="查看解說" />
          <Step n="5" text="10 題後看成績" />
        </Section>

        {/* 遊戲模式 */}
        <Section color='rgba(167,139,250,.08)' border='rgba(167,139,250,.22)'>
          <SectionTitle>🎮 遊戲模式</SectionTitle>
          <ModeRow emoji='🧑' name='新手' desc='30 秒' />
          <ModeRow emoji='⭐' name='高手' desc='15 秒' />
          <ModeRow emoji='📚' name='教育' desc='答後有詳細解說' />
          <ModeRow emoji='🌴' name='假日' desc='35 秒輕鬆玩' />
          <ModeRow emoji='🌐' name='連線對戰' desc='跨裝置即時競賽' />
        </Section>

        {/* 金幣與道具 */}
        <Section color='rgba(255,210,50,.07)' border='rgba(255,210,50,.22)'>
          <SectionTitle>🪙 金幣與道具</SectionTitle>
          <p style={bodyText}>答對得金幣 → 商店買道具</p>
          <Item emoji='🐢' name='冷靜龜' desc='+10 秒' />
          <Item emoji='🛡️' name='防護盾' desc='答錯不扣分' />
          <Item emoji='⏰' name='時間停止器' desc='暫停 15 秒' />
          <Item emoji='🎫' name='跳題卡' desc='略過這題' />
          <Item emoji='🧲' name='金幣磁鐵' desc='+5 金幣/答對' />
          <Item emoji='💰' name='雙倍金幣' desc='本回合翻倍' />
        </Section>

        {/* 圖鑑 */}
        <Section color='rgba(80,200,240,.07)' border='rgba(80,200,240,.2)'>
          <SectionTitle>📖 圖鑑</SectionTitle>
          <p style={bodyText}>30 隻詐騙怪獸，升級自動解鎖或花金幣解鎖，查看辨識與應對方式。</p>
        </Section>

        {/* 防詐提醒 */}
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
          {isRevisit ? '← 返回主選單' : '我閱讀完了，前往設定 →'}
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

function Step({ n, text }) {
  return (
    <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:9 }}>
      <div style={{
        width:26, height:26, borderRadius:'50%', flexShrink:0,
        background:'rgba(91,141,238,.25)', border:'1px solid rgba(91,141,238,.45)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:13, fontWeight:700, color:'#a8c4ff',
      }}>{n}</div>
      <div style={{ fontSize:16, color:'rgba(200,220,255,.85)', lineHeight:1.8 }}>{text}</div>
    </div>
  )
}

function ModeRow({ emoji, name, desc }) {
  return (
    <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:8 }}>
      <span style={{ fontSize:20, flexShrink:0 }}>{emoji}</span>
      <div>
        <span style={{ fontSize:15, fontWeight:700, color:'#c8dbff' }}>{name}　</span>
        <span style={{ fontSize:14, color:'rgba(180,200,255,.65)' }}>{desc}</span>
      </div>
    </div>
  )
}

function Item({ emoji, name, desc }) {
  return (
    <div style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:7 }}>
      <span style={{ fontSize:18, flexShrink:0 }}>{emoji}</span>
      <div style={{ fontSize:14, color:'rgba(200,220,255,.8)', lineHeight:1.7 }}>
        <strong style={{ color:'#ffd27a' }}>{name}</strong>：{desc}
      </div>
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

const bodyText = { fontSize:15, color:'rgba(200,220,255,.8)', lineHeight:1.8, marginBottom:10 }
