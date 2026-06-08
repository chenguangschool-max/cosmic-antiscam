import { useState, useEffect, useRef } from 'react'
import { useGame } from '../GameContext'
import { DETECTIVE_CASES } from '../data/detectiveCases'

export default function DetectiveMode({ navigate }) {
  const { addCoins, addXp } = useGame()
  const [phase, setPhase] = useState('caseSelect')
  const [caseData, setCaseData] = useState(null)
  const [qIndex, setQIndex] = useState(0)
  const [trust, setTrust] = useState(0) // 0–100, victim's trust in scammer
  const [flagged, setFlagged] = useState({}) // { evidenceId: true }
  const [openEvidence, setOpenEvidence] = useState(null)
  const [selected, setSelected] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [earnedCoins, setEarnedCoins] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [qResults, setQResults] = useState([])
  const timerRef = useRef(null)
  const trustRef = useRef(0)

  const q = caseData?.questions[qIndex]

  useEffect(() => {
    if (phase === 'investigate') {
      setFlagged({})
      setOpenEvidence(null)
      setTimeLeft(q.timeLimit)
      trustRef.current = trust
      timerRef.current = setInterval(() => {
        trustRef.current = Math.min(100, trustRef.current + (80 / q.timeLimit))
        setTrust(Math.round(trustRef.current))
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current)
            setPhase('answer')
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase, qIndex])

  const toggleFlag = (id) => {
    setFlagged(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const proceedToAnswer = () => {
    clearInterval(timerRef.current)
    setPhase('answer')
  }

  const handleAnswer = (opt) => {
    clearInterval(timerRef.current)
    setSelected(opt)

    const suspiciousIds = q.suspiciousIds || []
    const flaggedIds = Object.keys(flagged).filter(k => flagged[k])
    const correctFlags = flaggedIds.filter(id => suspiciousIds.includes(id)).length
    const wrongFlags = flaggedIds.filter(id => !suspiciousIds.includes(id)).length

    let coins = 0
    let trustDelta = 0

    if (opt.correct) {
      const baseCoins = 40
      const flagBonus = suspiciousIds.length > 0 ? Math.round((correctFlags / suspiciousIds.length) * 30) : 30
      const timeBonus = Math.round((timeLeft / q.timeLimit) * 20)
      const trustBonus = Math.round(((100 - trust) / 100) * 10)
      coins = baseCoins + flagBonus + timeBonus + trustBonus - (wrongFlags * 5)
      coins = Math.max(10, Math.min(100, coins))
      trustDelta = -30 - correctFlags * 5
    } else {
      coins = 0
      trustDelta = 25
    }

    const newTrust = Math.max(0, Math.min(100, trust + trustDelta))
    setTrust(newTrust)
    setEarnedCoins(prev => prev + Math.max(0, coins))
    if (opt.correct) setCorrectCount(c => c + 1)

    setQResults(prev => [...prev, {
      correct: opt.correct,
      coins: Math.max(0, coins),
      correctFlags,
      totalSuspicious: suspiciousIds.length,
    }])

    setPhase('feedback')
  }

  const nextQuestion = () => {
    if (qIndex + 1 >= caseData.questions.length) {
      const totalCoins = Math.min(300, earnedCoins)
      addCoins(totalCoins)
      addXp(totalCoins * 2)
      setPhase('result')
    } else {
      setQIndex(i => i + 1)
      setSelected(null)
      setPhase('investigate')
    }
  }

  if (phase === 'caseSelect') return <CaseSelectScreen cases={DETECTIVE_CASES} onSelect={(c) => { setCaseData(c); setPhase('intro') }} navigate={navigate} />
  if (!caseData) return null
  if (phase === 'intro') return <IntroScreen c={caseData} onStart={() => setPhase('investigate')} navigate={navigate} />
  if (phase === 'result') return <ResultScreen c={caseData} coins={Math.min(300, earnedCoins)} correct={correctCount} total={caseData.questions.length} trust={trust} navigate={navigate} onBack={() => { setPhase('caseSelect'); setCaseData(null); setQIndex(0); setTrust(0); setEarnedCoins(0); setCorrectCount(0); setQResults([]) }} />

  return (
    <div style={{ padding:'16px 16px 0', position:'relative', zIndex:2, minHeight:'100vh', display:'flex', flexDirection:'column' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ fontSize:11, color:'rgba(140,180,255,.5)', fontFamily:'Orbitron,monospace' }}>
          🔍 {caseData.caseNumber} 第 {qIndex+1}/{caseData.questions.length} 題
        </div>
        {(phase === 'investigate') && (
          <div style={{ fontSize:13, fontWeight:700, color: timeLeft <= 8 ? '#ff6b6b' : '#7ee8c0' }}>
            ⏱ {timeLeft}s
          </div>
        )}
      </div>

      {/* Trust bar */}
      <TrustBar trust={trust} victim={caseData.victim} />

      {/* Scene */}
      <div style={{ background:'rgba(91,141,238,.08)', border:'1px solid rgba(91,141,238,.2)', borderRadius:12, padding:'12px 14px', marginBottom:12 }}>
        <div style={{ fontSize:12, color:'rgba(140,180,255,.6)', marginBottom:6 }}>📍 現場情況</div>
        <div style={{ fontSize:14, color:'rgba(210,225,255,.9)', lineHeight:1.7 }}>{q.scene}</div>
        {q.lineChat && <LineChat messages={q.lineChat} />}
        {!q.lineChat && q.message && (
          <div style={{ marginTop:10, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'10px 12px' }}>
            <div style={{ fontSize:13, color:'rgba(255,220,160,.9)', lineHeight:1.7, fontStyle:'italic' }}>💬 {q.message}</div>
          </div>
        )}
      </div>

      {/* Evidence */}
      {(phase === 'investigate' || phase === 'answer' || phase === 'feedback') && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:12, color:'rgba(140,180,255,.6)', marginBottom:8 }}>
            🗂 調查線索（點開查看，可疑的標記 🚩）
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {q.evidence.map(ev => {
              const isFlagged = !!flagged[ev.id]
              const showResult = phase === 'feedback'
              const isCorrectFlag = showResult && ev.isSuspicious
              const isWrongFlag = showResult && !ev.isSuspicious && isFlagged
              return (
                <div key={ev.id}>
                  <div
                    onClick={() => setOpenEvidence(openEvidence === ev.id ? null : ev.id)}
                    style={{
                      display:'flex', alignItems:'center', gap:10,
                      background: showResult
                        ? (isCorrectFlag ? 'rgba(255,80,80,.12)' : isWrongFlag ? 'rgba(255,150,50,.1)' : 'rgba(50,200,150,.08)')
                        : (isFlagged ? 'rgba(255,80,80,.1)' : 'rgba(255,255,255,.04)'),
                      border: `1px solid ${showResult
                        ? (isCorrectFlag ? 'rgba(255,80,80,.35)' : isWrongFlag ? 'rgba(255,150,50,.3)' : 'rgba(50,200,150,.25)')
                        : (isFlagged ? 'rgba(255,80,80,.35)' : 'rgba(255,255,255,.1)')}`,
                      borderRadius:10, padding:'9px 12px', cursor:'pointer',
                    }}
                  >
                    <span style={{ fontSize:18 }}>{ev.icon}</span>
                    <span style={{ flex:1, fontSize:13, color:'rgba(200,220,255,.85)' }}>{ev.label}</span>
                    {showResult && ev.isSuspicious && <span style={{ fontSize:11, color:'#ff9e9e' }}>🚩 可疑</span>}
                    {showResult && !ev.isSuspicious && <span style={{ fontSize:11, color:'#7ee8c0' }}>✅ 正常</span>}
                    {!showResult && phase === 'investigate' && (
                      <button
                        onClick={e => { e.stopPropagation(); toggleFlag(ev.id) }}
                        style={{
                          background: isFlagged ? 'rgba(255,80,80,.25)' : 'rgba(255,255,255,.07)',
                          border: `1px solid ${isFlagged ? 'rgba(255,80,80,.5)' : 'rgba(255,255,255,.15)'}`,
                          borderRadius:8, padding:'3px 10px', cursor:'pointer',
                          color: isFlagged ? '#ff9e9e' : 'rgba(180,200,255,.5)', fontSize:11,
                        }}
                      >{isFlagged ? '🚩 已標記' : '標記'}</button>
                    )}
                    <span style={{ fontSize:11, color:'rgba(140,180,255,.4)' }}>{openEvidence === ev.id ? '▲' : '▼'}</span>
                  </div>
                  {openEvidence === ev.id && (
                    <div style={{
                      background:'rgba(10,20,50,.7)', border:'1px solid rgba(91,141,238,.2)',
                      borderRadius:'0 0 10px 10px', padding:'10px 14px', marginTop:-1,
                    }}>
                      {ev.image && (
                        <img
                          src={ev.image}
                          alt={ev.label}
                          onError={e => { e.target.style.display = 'none' }}
                          style={{ width:'100%', maxHeight:180, objectFit:'cover', borderRadius:8, marginBottom:10, display:'block' }}
                        />
                      )}
                      <pre style={{ fontSize:12, color:'rgba(200,220,255,.8)', lineHeight:1.8, whiteSpace:'pre-wrap', margin:0, fontFamily:'Noto Sans TC,sans-serif' }}>
                        {ev.content}
                      </pre>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Answer options */}
      {phase === 'answer' && (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:13, color:'#a8c4ff', fontWeight:700, marginBottom:10 }}>{q.question}</div>
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)} style={{
              width:'100%', textAlign:'left', padding:'12px 14px', borderRadius:11, marginBottom:8,
              background:'rgba(91,141,238,.1)', border:'1px solid rgba(91,141,238,.3)',
              color:'rgba(210,225,255,.9)', fontSize:14, cursor:'pointer', lineHeight:1.6,
              fontFamily:'Noto Sans TC,sans-serif',
            }}>{opt.text}</button>
          ))}
        </div>
      )}

      {/* Investigate CTA */}
      {phase === 'investigate' && (
        <div style={{ marginTop:'auto', paddingBottom:24 }}>
          <button onClick={proceedToAnswer} style={{
            width:'100%', padding:14, borderRadius:12,
            background:'linear-gradient(135deg,rgba(91,141,238,.3),rgba(167,139,250,.25))',
            border:'1px solid rgba(91,141,238,.5)',
            color:'#e0eaff', fontSize:15, fontWeight:700, cursor:'pointer',
            fontFamily:'Noto Sans TC,sans-serif',
          }}>調查完畢，進行判斷 →</button>
        </div>
      )}

      {/* Feedback */}
      {phase === 'feedback' && selected && (
        <div style={{ marginBottom:24 }}>
          <div style={{
            padding:'14px 16px', borderRadius:12, marginBottom:10,
            background: selected.correct ? 'rgba(50,200,150,.1)' : 'rgba(255,80,80,.1)',
            border: `1px solid ${selected.correct ? 'rgba(50,200,150,.3)' : 'rgba(255,80,80,.3)'}`,
          }}>
            <div style={{ fontSize:15, fontWeight:700, color: selected.correct ? '#7ee8c0' : '#ff9e9e', marginBottom:6 }}>
              {selected.correct ? '✅ 判斷正確！' : '❌ 判斷錯誤'}
            </div>
            <div style={{ fontSize:13, color:'rgba(200,220,255,.85)', lineHeight:1.7 }}>{selected.explanation}</div>
            {qResults[qResults.length-1] && (
              <div style={{ marginTop:8, fontSize:12, color:'rgba(255,210,50,.8)' }}>
                🪙 +{qResults[qResults.length-1].coins} 防詐金幣
                {qResults[qResults.length-1].totalSuspicious > 0 && (
                  <span style={{ marginLeft:8, color:'rgba(140,180,255,.6)' }}>
                    （找出 {qResults[qResults.length-1].correctFlags}/{qResults[qResults.length-1].totalSuspicious} 個可疑線索）
                  </span>
                )}
              </div>
            )}
          </div>
          <button onClick={nextQuestion} style={{
            width:'100%', padding:13, borderRadius:12,
            background:'rgba(91,141,238,.15)', border:'1px solid rgba(91,141,238,.4)',
            color:'#c8dbff', fontSize:14, fontWeight:700, cursor:'pointer',
            fontFamily:'Noto Sans TC,sans-serif',
          }}>
            {qIndex + 1 >= caseData.questions.length ? '結案 →' : '下一個線索 →'}
          </button>
        </div>
      )}
    </div>
  )
}

function TrustBar({ trust, victim }) {
  const color = trust < 40 ? '#7ee8c0' : trust < 70 ? '#ffd27a' : '#ff6b6b'
  const label = trust < 30 ? `${victim}：「我要再想想...」` : trust < 60 ? `${victim}：「好像有點奇怪...」` : trust < 85 ? `${victim}：「應該沒問題吧...」` : `${victim}：「我相信他們！」`
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <div style={{ fontSize:11, color:'rgba(140,180,255,.6)' }}>受害者對詐騙集團的信任值</div>
        <div style={{ fontSize:11, fontWeight:700, color }}>{trust}%</div>
      </div>
      <div style={{ height:6, background:'rgba(255,255,255,.08)', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${trust}%`, background:`linear-gradient(90deg, #7ee8c0, ${color})`, borderRadius:4, transition:'width .5s ease' }} />
      </div>
      <div style={{ fontSize:11, color:'rgba(200,220,255,.55)', marginTop:4, fontStyle:'italic' }}>{label}</div>
    </div>
  )
}

function IntroScreen({ c, onStart, navigate }) {
  return (
    <div style={{ padding:'24px 18px', position:'relative', zIndex:2, minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <button style={{ alignSelf:'flex-start', background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.14)', borderRadius:20, padding:'5px 13px', color:'rgba(180,200,255,.7)', fontSize:12, cursor:'pointer', marginBottom:20 }} onClick={() => navigate('menu')}>← 返回</button>
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{ fontSize:48, marginBottom:8 }}>🔍</div>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:16, fontWeight:900, color:'#fff', letterSpacing:2, marginBottom:4 }}>偵探模式</div>
        <div style={{ fontSize:12, color:'rgba(140,180,255,.5)' }}>165 反詐騙特別調查組</div>
      </div>
      <div style={{ background:'rgba(91,141,238,.1)', border:'1px solid rgba(91,141,238,.25)', borderRadius:14, padding:'16px 18px', marginBottom:14 }}>
        <div style={{ fontSize:11, color:'rgba(140,180,255,.5)', marginBottom:6, fontFamily:'Orbitron,monospace' }}>案件 {c.caseNumber}</div>
        <div style={{ fontSize:17, fontWeight:700, color:'#e0eaff', marginBottom:10 }}>{c.title}</div>
        <div style={{ display:'flex', gap:16, marginBottom:10 }}>
          <div><div style={{ fontSize:10, color:'rgba(140,180,255,.5)' }}>受害者</div><div style={{ fontSize:13, color:'#c8dbff' }}>{c.victim}</div></div>
          <div><div style={{ fontSize:10, color:'rgba(140,180,255,.5)' }}>損失金額</div><div style={{ fontSize:13, color:'#ff9e9e' }}>{c.loss}</div></div>
          <div><div style={{ fontSize:10, color:'rgba(140,180,255,.5)' }}>手法</div><div style={{ fontSize:13, color:'#ffd27a' }}>{c.method}</div></div>
        </div>
        <div style={{ fontSize:13, color:'rgba(200,220,255,.8)', lineHeight:1.7 }}>{c.intro}</div>
      </div>
      <div style={{ background:'rgba(255,210,50,.07)', border:'1px solid rgba(255,210,50,.2)', borderRadius:12, padding:'12px 14px', marginBottom:20 }}>
        <div style={{ fontSize:12, fontWeight:700, color:'#ffd27a', marginBottom:6 }}>🎯 任務說明</div>
        <div style={{ fontSize:12, color:'rgba(210,200,150,.8)', lineHeight:1.8 }}>
          • 每題調查現場線索，標記可疑項目<br />
          • 時間越快、線索找越準，金幣越多<br />
          • 受害者信任值歸零前阻止詐騙<br />
          • 最高可獲得 300 防詐金幣
        </div>
      </div>
      <div style={{ marginTop:'auto', paddingBottom:28 }}>
        <button onClick={onStart} style={{
          width:'100%', padding:16, borderRadius:14,
          background:'linear-gradient(135deg,rgba(91,141,238,.35),rgba(167,139,250,.3))',
          border:'1px solid rgba(91,141,238,.6)',
          color:'#e0eaff', fontSize:16, fontWeight:700, cursor:'pointer',
          fontFamily:'Noto Sans TC,sans-serif', letterSpacing:1,
        }}>開始調查 🔍</button>
      </div>
    </div>
  )
}

function ResultScreen({ c, coins, correct, total, trust, navigate, onBack }) {
  const saved = trust < 50
  return (
    <div style={{ padding:'24px 18px', position:'relative', zIndex:2, textAlign:'center' }}>
      <div style={{ fontSize:52, marginBottom:10 }}>{saved ? '🏆' : trust < 80 ? '🔍' : '😔'}</div>
      <div style={{ fontFamily:'Orbitron,monospace', fontSize:16, fontWeight:900, color:'#fff', marginBottom:6 }}>
        {saved ? '案件偵破！' : trust < 80 ? '勉強阻止' : '案件失敗'}
      </div>
      <div style={{ fontSize:13, color:'rgba(180,200,255,.7)', marginBottom:16, lineHeight:1.7 }}>
        {saved ? `你成功降低了${c.victim}對詐騙集團的信任，成功阻止！` : trust < 80 ? `你找出了部分線索，但${c.victim}仍有些動搖。` : `${c.victim}最終還是被詐騙集團說服了...`}
      </div>
      <div style={{ background:'rgba(91,141,238,.1)', border:'1px solid rgba(91,141,238,.25)', borderRadius:14, padding:'16px', marginBottom:20 }}>
        <div style={{ fontSize:13, color:'rgba(140,180,255,.6)', marginBottom:12 }}>案件結算 {c.caseNumber}</div>
        <div style={{ display:'flex', justifyContent:'space-around' }}>
          <div><div style={{ fontSize:22, fontWeight:700, color:'#ffd27a' }}>🪙 {coins}</div><div style={{ fontSize:11, color:'rgba(140,180,255,.5)' }}>防詐金幣</div></div>
          <div><div style={{ fontSize:22, fontWeight:700, color:'#7ee8c0' }}>{correct}/{total}</div><div style={{ fontSize:11, color:'rgba(140,180,255,.5)' }}>正確判斷</div></div>
          <div><div style={{ fontSize:22, fontWeight:700, color: trust < 50 ? '#7ee8c0' : '#ff9e9e' }}>{trust}%</div><div style={{ fontSize:11, color:'rgba(140,180,255,.5)' }}>最終信任值</div></div>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8, maxWidth:260, margin:'0 auto' }}>
        <button onClick={onBack} style={btnMain}>選擇其他案件 🗂</button>
        <button onClick={() => navigate('menu')} style={btnSub}>回主選單</button>
      </div>
    </div>
  )
}

function CaseSelectScreen({ cases, onSelect, navigate }) {
  const categoryColor = { fraud:'#fb923c', invest:'#ec4899', social:'#a78bfa', cyber:'#38bdf8', romance:'#f472b6' }
  return (
    <div style={{ padding:'20px 18px', position:'relative', zIndex:2, minHeight:'100vh' }}>
      <button style={{ background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.14)', borderRadius:20, padding:'5px 13px', color:'rgba(180,200,255,.7)', fontSize:12, cursor:'pointer', marginBottom:20 }} onClick={() => navigate('menu')}>← 返回</button>
      <div style={{ textAlign:'center', marginBottom:22 }}>
        <div style={{ fontSize:40, marginBottom:6 }}>🔍</div>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:15, fontWeight:900, color:'#fff', letterSpacing:2 }}>偵探模式</div>
        <div style={{ fontSize:12, color:'rgba(140,180,255,.5)', marginTop:4 }}>165 反詐騙特別調查組 — 選擇案件</div>
      </div>
      {cases.map((c, i) => (
        <div key={c.id} onClick={() => onSelect(c)} style={{
          background:'rgba(91,141,238,.07)', border:'1px solid rgba(91,141,238,.22)',
          borderRadius:14, padding:'14px 16px', marginBottom:10, cursor:'pointer',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <span style={{ fontFamily:'Orbitron,monospace', fontSize:10, color:'rgba(140,180,255,.5)' }}>{c.caseNumber}</span>
            <span style={{ flex:1, fontSize:15, fontWeight:700, color:'#e0eaff' }}>{c.title}</span>
          </div>
          <div style={{ display:'flex', gap:12, fontSize:12 }}>
            <span style={{ color:'rgba(140,180,255,.6)' }}>受害者 <span style={{ color:'#c8dbff' }}>{c.victim}</span></span>
            <span style={{ color:'rgba(255,150,150,.6)' }}>損失 <span style={{ color:'#ff9e9e' }}>{c.loss}</span></span>
          </div>
          <div style={{ marginTop:6, fontSize:11, padding:'2px 9px', borderRadius:20, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(180,200,255,.6)', display:'inline-block' }}>
            {c.method}
          </div>
        </div>
      ))}
    </div>
  )
}

function LineChat({ messages }) {
  const scammerName = messages.find(m => m.sender === 'scammer')?.name || '未知聯繫人'
  return (
    <div style={{ borderRadius:10, overflow:'hidden', marginTop:12, border:'1px solid rgba(0,0,0,.2)' }}>
      <div style={{ background:'#00b900', padding:'8px 12px', display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>💬</div>
        <span style={{ color:'#fff', fontSize:13, fontWeight:600 }}>{scammerName}</span>
        <span style={{ marginLeft:'auto', fontSize:10, color:'rgba(255,255,255,.6)' }}>LINE</span>
      </div>
      <div style={{ background:'#c3e1be', padding:'10px 8px', display:'flex', flexDirection:'column', gap:8, maxHeight:220, overflowY:'auto' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display:'flex', justifyContent: msg.sender === 'victim' ? 'flex-end' : 'flex-start', alignItems:'flex-end', gap:5 }}>
            {msg.sender === 'scammer' && (
              <div style={{ width:30, height:30, borderRadius:'50%', background:'#00b900', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>💬</div>
            )}
            {msg.sender === 'scammer' && (
              <div>
                <div style={{ fontSize:10, color:'rgba(0,0,0,.45)', marginBottom:2 }}>{msg.name}</div>
                <div style={{ background:'#fff', color:'#222', borderRadius:'2px 12px 12px 12px', padding:'8px 11px', fontSize:13, lineHeight:1.55, maxWidth:220 }}>{msg.text}</div>
              </div>
            )}
            {msg.sender === 'victim' && (
              <div style={{ background:'#00b900', color:'#fff', borderRadius:'12px 2px 12px 12px', padding:'8px 11px', fontSize:13, lineHeight:1.55, maxWidth:220 }}>{msg.text}</div>
            )}
            <div style={{ fontSize:10, color:'rgba(0,0,0,.35)', flexShrink:0, marginBottom:2 }}>{msg.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const btnMain = { padding:12, borderRadius:11, fontSize:13, cursor:'pointer', fontFamily:'Noto Sans TC,sans-serif', background:'rgba(91,141,238,.18)', border:'1px solid rgba(91,141,238,.48)', color:'#c8dbff' }
const btnSub  = { padding:12, borderRadius:11, fontSize:13, cursor:'pointer', fontFamily:'Noto Sans TC,sans-serif', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(180,200,255,.6)' }
