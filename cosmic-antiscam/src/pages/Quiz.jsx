import { useState, useEffect, useRef } from 'react'
import { useGame } from '../GameContext'
import { ITEMS, generateQuestion, EDU_TIPS } from '../data'
import UnlockOverlay from '../components/UnlockOverlay'

const starsH = n => '★'.repeat(n) + '☆'.repeat(5-n)

export default function Quiz({ mode, navigate, onResult }) {
  const { coins, bag, addCoins, spendCoins: _sc, addXp, monsters, unlockMonster } = useGame()
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [quizCoins, setQuizCoins] = useState(0)
  const [quizXp, setQuizXp] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState(null) // 'correct'|'wrong'
  const [timerVal, setTimerVal] = useState(mode?.time || 20)
  const [feedback, setFeedback] = useState(null)
  const [usedItems, setUsedItems] = useState({})
  const [bagState, setBagState] = useState({ ...bag })
  const [shields, setShields] = useState(bag['shield'] || 0)
  const [coinMult] = useState((bag['doublecoins'] || 0) > 0 ? 2 : 1)
  const [extraCoins] = useState((bag['magnet'] || 0) > 0 ? 5 : 0)
  const [justUnlockedMonster, setJustUnlockedMonster] = useState(null)
  const [ulQueue, setUlQueue] = useState([])
  const [speaking, setSpeaking] = useState(false)
  const usedTopics = useRef([])
  const planRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    const p = [1,1,0,1,1,0,1,1,1,0]
    for (let i = p.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [p[i],p[j]]=[p[j],p[i]] }
    planRef.current = p
    loadQuestion(0, p)
    return () => clearInterval(timerRef.current)
  }, [])

  const loadQuestion = async (idx, plan) => {
    const p = plan || planRef.current
    if (idx >= 10) return
    try {
      const q = await generateQuestion(p[idx] === 1, usedTopics.current)
      usedTopics.current.push(q.topic)
      setQuestions(prev => { const next=[...prev]; next[idx]=q; return next })
      if (idx + 1 < 10) generateQuestion(p[idx+1]===1, usedTopics.current).then(q2 => {
        usedTopics.current.push(q2.topic)
        setQuestions(prev => { const next=[...prev]; next[idx+1]=q2; return next })
      })
    } catch(e) { console.error(e) }
  }

  useEffect(() => {
    if (questions[currentQ] && !answered) startTimer()
    return () => clearInterval(timerRef.current)
  }, [currentQ, questions[currentQ]])

  useEffect(() => {
    const cur = questions[currentQ]
    if (!cur || answered) return
    window.speechSynthesis?.cancel()
    const u = new SpeechSynthesisUtterance(cur.text)
    u.lang = 'zh-TW'; u.rate = 0.82; u.pitch = 0.9
    u.onstart = () => setSpeaking(true)
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    window.speechSynthesis?.speak(u)
  }, [questions[currentQ]])

  const startTimer = () => {
    clearInterval(timerRef.current)
    setTimerVal(mode?.time || 20)
    let t = mode?.time || 20
    timerRef.current = setInterval(() => {
      t--
      setTimerVal(t)
      if (t <= 0) { clearInterval(timerRef.current); if (!answered) handleTimeUp() }
    }, 1000)
  }

  const handleTimeUp = () => {
    setAnswered(true)
    const q = questions[currentQ]
    setFeedback({ correct: false, text: `⏰ 時間到！${q?.explanation||''}` })
  }

  const handleAnswer = (val) => {
    if (answered) return
    clearInterval(timerRef.current)
    setAnswered(true)
    const q = questions[currentQ]
    if (val === q.answer) {
      setSelected('correct')
      const earned = (10 + extraCoins) * coinMult
      addCoins(earned)
      setQuizCoins(c => c + earned)
      const xpGain = 30
      addXp(xpGain, (m) => { setUlQueue(prev => [...prev, { m, isCoin:false }]) })
      setQuizXp(x => x + xpGain)
      setScore(s => s + 1)
      setFeedback({ correct: true, text: `✅ 答對！+${earned}🪙 +${xpGain}XP\n${q.explanation}` })
    } else {
      setSelected('wrong')
      let shielded = false
      if (shields > 0) { setShields(s=>s-1); shielded = true }
      setFeedback({ correct: false, text: `❌ 答錯了！${shielded?'（防護盾保護）':''}\n${q.explanation}` })
    }
    if (currentQ + 2 < 10 && !questions[currentQ+2]) loadQuestion(currentQ+2)
  }

  const speakQuestion = () => {
    if (!window.speechSynthesis || !q) return
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(q.text)
    u.lang = 'zh-TW'; u.pitch = 0.9
    u.rate = 0.88
    u.onstart = () => setSpeaking(true)
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(u)
  }

  const handleNext = () => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
    const next = currentQ + 1
    if (next >= 10) {
      const bonusXp = score * 20
      addXp(bonusXp, (m) => { setUlQueue(prev => [...prev, { m, isCoin:false }]) })
      addCoins(score * 5)
      onResult({ score, quizCoins: quizCoins + score*5, quizXp: quizXp + bonusXp })
      navigate('result')
      return
    }
    setCurrentQ(next)
    setAnswered(false)
    setSelected(null)
    setFeedback(null)
    if (!questions[next]) loadQuestion(next)
  }

  const handleUseItem = (item) => {
    if (usedItems[item.id] || (bagState[item.id]||0) <= 0) return
    setBagState(prev => ({ ...prev, [item.id]: prev[item.id]-1 }))
    setUsedItems(prev => ({ ...prev, [item.id]: true }))
    if (item.id === 'turtle') { setTimerVal(t => t+10) }
    if (item.id === 'clock') { clearInterval(timerRef.current); setTimeout(startTimer, 15000) }
    if (item.id === 'pass') {
      clearInterval(timerRef.current)
      setAnswered(true)
      setFeedback({ correct: true, text: '🎫 跳題！略過這題。' })
    }
  }

  const closeUlOverlay = () => {
    setUlQueue(prev => {
      const next = [...prev]; next.shift(); return next
    })
  }

  const q = questions[currentQ]
  const pct = ((currentQ+1)/10*100)
  const isEdu = mode?.id === 'edu'
  const tips = isEdu && q ? (EDU_TIPS[q.topic] || null) : null
  const warn = !isEdu && timerVal <= 5
  const notAnswered = answered && selected === null

  return (
    <div style={{ padding:18, position:'relative', zIndex:2 }}>
      {/* top */}
      {isEdu && (
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10, padding:'6px 12px', background:'rgba(91,141,238,.1)', border:'1px solid rgba(91,141,238,.25)', borderRadius:20 }}>
          <span style={{ fontSize:13 }}>📚</span>
          <span style={{ fontSize:10, color:'#a8c4ff', letterSpacing:1.5, fontWeight:600 }}>教育模式</span>
          <span style={{ fontSize:9, color:'rgba(140,180,255,.5)', marginLeft:4 }}>每題後有詳細解說</span>
        </div>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={coinBadge}>🪙 {coins}</div>
        <div style={{ flex:1, margin:'0 12px' }}>
          <div style={{ fontSize:10, color:'rgba(180,200,255,.5)', marginBottom:3 }}>第 {currentQ+1} 題 / 共 10 題</div>
          <div style={{ height:4, background:'rgba(255,255,255,.07)', borderRadius:4, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#5b8dee,#a78bfa)', transition:'width .4s', borderRadius:4 }} />
          </div>
        </div>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:16, fontWeight:700, color: warn ? '#ff6b6b':'rgba(180,200,255,.7)', animation: warn ? 'pulse .5s infinite':'' }}>
          {timerVal}
        </div>
      </div>

      {/* item bar */}
      <div style={{ display:'flex', gap:7, marginBottom:11, flexWrap:'wrap' }}>
        {['turtle','clock','pass'].map(id => {
          const qty = bagState[id]||0; if (!qty) return null
          const item = ITEMS.find(i => i.id===id)
          return (
            <button key={id} onClick={() => handleUseItem(item)} style={{
              display:'flex', alignItems:'center', gap:4,
              background:'rgba(255,255,255,.05)', border:'1px solid rgba(91,141,238,.18)',
              borderRadius:20, padding:'4px 11px', fontSize:11, cursor:'pointer', color:'#c8dbff',
              opacity: usedItems[id] ? .3 : 1, pointerEvents: usedItems[id] ? 'none':'auto',
              fontFamily:'Noto Sans TC,sans-serif',
            }}>
              {item.emoji} {item.name} <span style={{ color:'var(--gold)', fontSize:9 }}>x{qty}</span>
            </button>
          )
        })}
      </div>

      {/* question card */}
      <div style={{ background:'rgba(255,255,255,.04)', border:`1px solid ${isEdu ? 'rgba(91,141,238,.32)' : 'rgba(91,141,238,.2)'}`, borderRadius:12, padding:16, marginBottom:12, minHeight:95 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
          <div style={{ fontSize:10, color:'rgba(140,180,255,.6)', letterSpacing:1 }}>
            {isEdu && q ? `📡 發件人：${q.signal}` : '📡 宇宙訊號偵測中'}
          </div>
          {q && (
            <button onClick={speakQuestion} style={{
              display:'flex', alignItems:'center', gap:4,
              background: speaking ? 'rgba(91,141,238,.22)' : 'rgba(255,255,255,.05)',
              border: `1px solid ${speaking ? 'rgba(91,141,238,.55)' : 'rgba(91,141,238,.2)'}`,
              borderRadius:20, padding:'3px 10px', fontSize:10, cursor:'pointer',
              color: speaking ? '#a8c4ff' : 'rgba(180,200,255,.45)',
              fontFamily:'Noto Sans TC,sans-serif', transition:'all .2s',
            }}>
              {speaking ? '⏹ 停止' : '🔊 朗讀'}
            </button>
          )}
        </div>
        {!q ? (
          <div style={{ display:'flex', alignItems:'center', gap:8, color:'rgba(180,200,255,.5)', fontSize:12 }}>
            <div style={{ width:14, height:14, border:'2px solid rgba(91,141,238,.22)', borderTopColor:'#5b8dee', borderRadius:'50%', animation:'spin .8s linear infinite', flexShrink:0 }} />
            正在產生題目...
          </div>
        ) : (
          <div style={{ fontSize:13, lineHeight:1.75, color:'#e0eaff' }}>{q.text}</div>
        )}
      </div>

      {/* choices */}
      {q && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[{label:'✅ 這是正常事件',val:0},{label:'🚨 這是異常詐騙',val:1}].map((o,i) => {
            let bg = 'rgba(255,255,255,.04)', bc = 'rgba(91,141,238,.2)', col = 'var(--text)'
            if (answered && feedback) {
              if (o.val === q.answer) { bg='rgba(50,200,150,.17)'; bc='rgba(50,200,150,.55)'; col='#8ee8c5' }
              else if (o.val !== q.answer && selected === (o.val===0?'wrong':'wrong')) { bg='rgba(255,80,80,.14)'; bc='rgba(255,80,80,.45)'; col='#ffaaaa' }
            }
            return (
              <button key={o.val} disabled={answered} onClick={() => handleAnswer(o.val)} style={{
                display:'flex', alignItems:'center', gap:10,
                background:bg, border:`1px solid ${bc}`, borderRadius:11, padding:'12px 15px', color:col,
                fontSize:13, cursor: answered?'default':'pointer', textAlign:'left',
                fontFamily:'Noto Sans TC,sans-serif', width:'100%',
              }}>
                <span style={{ width:24, height:24, borderRadius:'50%', background:'rgba(91,141,238,.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, flexShrink:0 }}>
                  {['A','B'][i]}
                </span>
                {o.label}
              </button>
            )
          })}
        </div>
      )}

      {/* feedback */}
      {feedback && !isEdu && (
        <div style={{
          marginTop:11, padding:'10px 14px', borderRadius:9, fontSize:12, lineHeight:1.6,
          background: feedback.correct ? 'rgba(50,200,150,.11)':'rgba(255,100,80,.09)',
          border: `1px solid ${feedback.correct ? 'rgba(50,200,150,.28)':'rgba(255,100,80,.25)'}`,
          color: feedback.correct ? '#9ee8c8':'#ffb3a7',
          animation:'slideUp .2s ease', whiteSpace:'pre-line',
        }}>
          {feedback.text}
        </div>
      )}

      {/* 教育模式詳細解說卡 */}
      {feedback && isEdu && q && (
        <div style={{ marginTop:11, animation:'slideUp .2s ease' }}>
          {/* 判決 + 類別 */}
          <div style={{
            display:'flex', alignItems:'center', gap:10,
            padding:'12px 14px', borderRadius:10, marginBottom:8,
            background: q.answer === 1 ? 'rgba(255,100,80,.1)' : 'rgba(50,200,150,.1)',
            border: `1px solid ${q.answer === 1 ? 'rgba(255,100,80,.3)' : 'rgba(50,200,150,.3)'}`,
          }}>
            <span style={{ fontSize:24, flexShrink:0 }}>{q.answer === 1 ? '🚨' : '✅'}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color: q.answer === 1 ? '#ffa58e' : '#8ee8c5' }}>
                {q.answer === 1 ? '這是詐騙訊息' : '這是正常通知'}
              </div>
              <div style={{ fontSize:11, color: feedback.correct ? 'rgba(140,220,180,.7)' : notAnswered ? 'rgba(255,210,80,.7)' : 'rgba(255,150,130,.7)', marginTop:2 }}>
                {notAnswered ? '⏰ 時間到，未作答' : feedback.correct ? '答對了！繼續保持' : '答錯了，記住這個特徵'}
              </div>
            </div>
            {tips && (
              <span style={{
                fontSize:9, padding:'3px 9px', borderRadius:20, flexShrink:0,
                background:`${tips.catColor}22`, border:`1px solid ${tips.catColor}44`,
                color: tips.catColor, letterSpacing:0.5,
              }}>{tips.cat}</span>
            )}
          </div>

          {/* 說明 */}
          <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(91,141,238,.18)', borderRadius:9, padding:'10px 13px', marginBottom:7 }}>
            <div style={{ fontSize:9, color:'rgba(140,180,255,.55)', letterSpacing:1.5, marginBottom:5 }}>📋 說明</div>
            <div style={{ fontSize:12, color:'#c8dbff', lineHeight:1.75 }}>{q.explanation}</div>
          </div>

          {/* 詐騙警示 */}
          {tips?.flags?.length > 0 && (
            <div style={{ background:'rgba(255,90,70,.06)', border:'1px solid rgba(255,90,70,.2)', borderRadius:9, padding:'10px 13px', marginBottom:7 }}>
              <div style={{ fontSize:9, color:'rgba(255,150,120,.7)', letterSpacing:1.5, marginBottom:7 }}>🚩 辨識此類詐騙的關鍵</div>
              {tips.flags.map((flag, i) => (
                <div key={i} style={{ display:'flex', gap:6, fontSize:11, color:'rgba(255,185,165,.85)', lineHeight:1.6, marginBottom:3 }}>
                  <span style={{ color:'rgba(255,120,90,.6)', flexShrink:0 }}>•</span>
                  {flag}
                </div>
              ))}
            </div>
          )}

          {/* 正確做法 */}
          {tips?.action && (
            <div style={{ background:'rgba(50,200,150,.06)', border:'1px solid rgba(50,200,150,.22)', borderRadius:9, padding:'10px 13px' }}>
              <div style={{ fontSize:9, color:'rgba(100,220,170,.65)', letterSpacing:1.5, marginBottom:5 }}>
                {tips.isNormal ? '💡 正常通知的特徵' : '✅ 遇到這種情況應該'}
              </div>
              <div style={{ fontSize:12, color:'rgba(165,235,200,.85)', lineHeight:1.75 }}>{tips.action}</div>
            </div>
          )}
        </div>
      )}

      {/* next */}
      {feedback && (
        <button onClick={handleNext} style={{
          width:'100%', marginTop:11, padding:11,
          background:'rgba(91,141,238,.18)', border:'1px solid rgba(91,141,238,.48)',
          borderRadius:11, color:'#c8dbff', fontSize:13, fontWeight:500, cursor:'pointer',
          fontFamily:'Noto Sans TC,sans-serif',
        }}>
          {currentQ+1 >= 10 ? '查看結果 →' : '下一題 →'}
        </button>
      )}

      {/* unlock queue */}
      {ulQueue.length > 0 && (
        <UnlockOverlay monster={ulQueue[0].m} isCoin={ulQueue[0].isCoin} onClose={closeUlOverlay} />
      )}
    </div>
  )
}

const coinBadge = { display:'flex', alignItems:'center', gap:5, background:'rgba(255,210,50,.1)', border:'1px solid rgba(255,210,50,.32)', borderRadius:20, padding:'4px 12px', color:'var(--gold)', fontSize:13, fontWeight:500 }
