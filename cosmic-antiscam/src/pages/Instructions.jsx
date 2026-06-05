import { useState, useEffect } from 'react'

export default function Instructions({ onDone, isRevisit }) {
  const [seconds, setSeconds] = useState(isRevisit ? 0 : 40)

  useEffect(() => {
    if (isRevisit) return
    const id = setInterval(() => setSeconds(s => s > 0 ? s - 1 : 0), 1000)
    return () => clearInterval(id)
  }, [isRevisit])

  const canProceed = isRevisit || seconds === 0

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
          <p style={bodyText}>
            這是一個訓練防詐騙能力的遊戲。你會看到各種訊息，要判斷它是「正常通知」還是「詐騙訊息」。
            答題愈準確，得到的金幣和經驗值愈多，等級也會提升！
          </p>
        </Section>

        {/* 如何作答 */}
        <Section color='rgba(91,141,238,.1)' border='rgba(91,141,238,.2)'>
          <SectionTitle>📋 如何作答</SectionTitle>
          <Step n="1" text="仔細閱讀畫面上出現的星際通訊訊息" />
          <Step n="2" text="根據訊息內容判斷：是「正常事件」還是「異常詐騙」" />
          <Step n="3" text="在時間倒數結束前，點擊下方的選項按鈕作答" />
          <Step n="4" text="系統立即告訴你答對或答錯，並說明理由" />
          <Step n="5" text="連續答完 10 題後，查看本局總成績" />
        </Section>

        {/* 遊戲模式 */}
        <Section color='rgba(167,139,250,.08)' border='rgba(167,139,250,.22)'>
          <SectionTitle>🎮 遊戲模式</SectionTitle>
          <ModeRow emoji='🧑' name='新手模式' desc='時間充裕（30秒），適合第一次玩的朋友' />
          <ModeRow emoji='⭐' name='高手模式' desc='時間緊迫（15秒），考驗你的判斷速度' />
          <ModeRow emoji='📚' name='教育模式' desc='答完每題後，詳細說明詐騙手法與預防方式' />
          <ModeRow emoji='🌴' name='假日模式' desc='輕鬆節奏（35秒），適合休閒練習' />
          <ModeRow emoji='👥' name='多人對戰' desc='2至4人輪流答題，看誰的防詐能力最強' />
          <ModeRow emoji='🌐' name='連線對戰' desc='與其他裝置的朋友即時連線，同步競賽' />
        </Section>

        {/* 金幣與道具 */}
        <Section color='rgba(255,210,50,.07)' border='rgba(255,210,50,.22)'>
          <SectionTitle>🪙 金幣與道具</SectionTitle>
          <p style={bodyText}>答對題目可以獲得金幣，金幣可以在「商店」購買道具：</p>
          <Item emoji='🐢' name='冷靜龜' desc='本題答題時間延長 10 秒' />
          <Item emoji='🛡️' name='防護盾' desc='答錯一次不扣分' />
          <Item emoji='⏰' name='時間停止器' desc='暫停倒數計時 15 秒' />
          <Item emoji='🎫' name='跳題卡' desc='略過當前這一題' />
          <Item emoji='🧲' name='金幣磁鐵' desc='答對額外獲得 5 枚金幣' />
          <Item emoji='💰' name='雙倍金幣' desc='本回合答對金幣全部翻倍' />
        </Section>

        {/* 圖鑑 */}
        <Section color='rgba(80,200,240,.07)' border='rgba(80,200,240,.2)'>
          <SectionTitle>📖 圖鑑收集</SectionTitle>
          <p style={bodyText}>
            遊戲中共有 30 隻詐騙怪獸！答題升級可以自動解鎖怪獸，也可以花金幣在圖鑑中解鎖。
            解鎖後可以查看每隻怪獸的詳細介紹、辨識方式和應對方法。
          </p>
        </Section>

        {/* 防詐提醒 */}
        <Section color='rgba(255,80,80,.07)' border='rgba(255,80,80,.25)'>
          <SectionTitle color='#ff9e9e'>🚨 現實生活防詐提醒</SectionTitle>
          <Remind text="任何要求你「立即轉帳」的訊息，先停下來，打電話給家人確認！" />
          <Remind text="正規銀行、政府機關、醫院，絕對不會用電話或簡訊要求你提供帳號密碼。" />
          <Remind text="收到中獎通知卻要先繳費？這 100% 是詐騙，直接忽略！" />
          <Remind text="孫子、親友突然換號碼緊急借錢？先用舊號碼打回去確認本人。" />
          <Remind text="不確定真假時，撥打 165 反詐騙專線查證，24 小時都有人接聽。" />
        </Section>

      </div>

      <div style={{ padding:'16px 0 28px' }}>
        {!isRevisit && !canProceed && (
          <div style={{ textAlign:'center', fontSize:13, color:'rgba(140,180,255,.5)', marginBottom:10 }}>
            請閱讀完畢，{seconds} 秒後可繼續
          </div>
        )}
        <button onClick={canProceed ? onDone : undefined} style={{
          width:'100%', padding:16, borderRadius:14,
          background: canProceed ? 'linear-gradient(135deg,rgba(91,141,238,.35),rgba(167,139,250,.3))' : 'rgba(91,141,238,.08)',
          border: `1px solid ${canProceed ? 'rgba(91,141,238,.6)' : 'rgba(91,141,238,.2)'}`,
          color: canProceed ? '#e0eaff' : 'rgba(140,180,255,.3)',
          fontSize:17, fontWeight:700,
          cursor: canProceed ? 'pointer' : 'default',
          fontFamily:'Noto Sans TC,sans-serif', letterSpacing:1,
          transition:'all .3s',
        }}>
          {isRevisit ? '← 返回主選單' : canProceed ? '我閱讀完了，前往設定 →' : `⏳ ${seconds}`}
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
