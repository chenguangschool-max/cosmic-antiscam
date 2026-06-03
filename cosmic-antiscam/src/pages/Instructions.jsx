export default function Instructions({ onDone }) {
  return (
    <div style={{ padding:'20px 18px 0', position:'relative', zIndex:2, minHeight:'100vh', display:'flex', flexDirection:'column' }}>

      {/* 標題 */}
      <div style={{ textAlign:'center', marginBottom:22 }}>
        <div style={{ fontSize:38, marginBottom:8 }}>🛸</div>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:16, fontWeight:900, color:'#fff', letterSpacing:2 }}>
          宇宙防詐任務
        </div>
        <div style={{ fontSize:11, color:'rgba(180,200,255,.45)', marginTop:3 }}>使用說明</div>
      </div>

      {/* 說明內容（可捲動） */}
      <div style={{ flex:1, overflowY:'auto', paddingBottom:16 }}>

        <Section icon="🎯" title="遊戲目標">
          訓練你識破詐騙訊息的能力！每道題目是一則星際通訊，你需要判斷它是「正常通知」還是「詐騙訊息」。
        </Section>

        <Section icon="📱" title="如何作答">
          閱讀題目後，選擇：{'\n'}
          <Bullet color="#34d399">✅ 這是正常事件</Bullet>
          <Bullet color="#ff6b6b">🚨 這是異常詐騙</Bullet>
          每題有限定時間，超時視同未答。
        </Section>

        <Section icon="🎮" title="遊戲模式">
          <Bullet>🧑 新手模式 — 時間充裕（30 秒）</Bullet>
          <Bullet>⭐ 高手模式 — 時間緊迫（15 秒）</Bullet>
          <Bullet>📚 教育模式 — 每題後有詳細解說</Bullet>
          <Bullet>🌴 假日模式 — 輕鬆休閒（35 秒）</Bullet>
          <Bullet>👥 多人對戰 — 輪流傳手機答題</Bullet>
          <Bullet>🌐 連線對戰 — 即時與朋友同步競賽</Bullet>
        </Section>

        <Section icon="🪙" title="金幣與等級">
          答對題目可獲得金幣與 XP。{'\n'}
          累積 XP 即可升等，升等時自動解鎖對應的詐騙怪物圖鑑。{'\n'}
          金幣可用於商店購買道具，或提前解鎖圖鑑中的怪物。
        </Section>

        <Section icon="📖" title="怪物圖鑑">
          共 30 種詐騙怪物等你解鎖！{'\n'}
          每隻怪物代表一種真實詐騙手法，點開後可查看詳細介紹、辨識警示與應對方式。
        </Section>

        <Section icon="🔊" title="朗讀功能">
          每道題目載入後會自動朗讀，方便無法低頭看螢幕時使用。點「⏹ 停止」可中斷，「🔊 朗讀」可重播。
        </Section>

        <Section icon="🚨" title="防詐騙提醒" highlight>
          遇到任何要求轉帳、提供帳密或點擊連結的訊息，請先停下來確認！可撥打 <strong style={{ color:'#ff9e9e' }}>165 反詐騙專線</strong> 查證。
        </Section>

      </div>

      {/* 確認按鈕 */}
      <div style={{ padding:'14px 0 28px', background:'linear-gradient(transparent, rgba(3,8,18,.95) 30%)' }}>
        <button onClick={onDone} style={{
          width:'100%', padding:15, borderRadius:14,
          background:'linear-gradient(135deg,rgba(91,141,238,.35),rgba(167,139,250,.3))',
          border:'1px solid rgba(91,141,238,.6)',
          color:'#e0eaff', fontSize:14, fontWeight:700,
          cursor:'pointer', fontFamily:'Noto Sans TC,sans-serif', letterSpacing:1,
        }}>
          我閱讀完了，開始任務 🚀
        </button>
      </div>
    </div>
  )
}

function Section({ icon, title, children, highlight }) {
  return (
    <div style={{
      marginBottom:14, padding:'12px 14px', borderRadius:12,
      background: highlight ? 'rgba(255,80,80,.07)' : 'rgba(255,255,255,.03)',
      border: `1px solid ${highlight ? 'rgba(255,80,80,.22)' : 'rgba(91,141,238,.15)'}`,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
        <span style={{ fontSize:15 }}>{icon}</span>
        <span style={{ fontSize:11, fontWeight:700, color: highlight ? '#ff9e9e' : '#a8c4ff', letterSpacing:1 }}>{title}</span>
      </div>
      <div style={{ fontSize:12, color:'rgba(200,220,255,.75)', lineHeight:1.8, whiteSpace:'pre-line' }}>
        {children}
      </div>
    </div>
  )
}

function Bullet({ children, color }) {
  return (
    <div style={{ fontSize:12, color: color || 'rgba(200,220,255,.75)', lineHeight:1.8 }}>{children}</div>
  )
}
