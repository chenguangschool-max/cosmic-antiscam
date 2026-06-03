import { useState, useEffect, useRef } from 'react'
import { useGame } from '../GameContext'
import { generateQuestion } from '../data'

const COLORS = ['#5b8dee', '#a78bfa', '#34d399', '#fb923c']
const MODE_TIME = 20

export default function MultiQuiz({ players, navigate, onDone }) {
  const { addCoins, addXp } = useGame()
  const [playerIdx, setPlayerIdx] = useState(0)
  const [results, setResults] = useState([])
  const [phase, setPhase] = useState('handoff') // 'handoff' | 'playing'

  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [quizCoins, setQuizCoins] = useState(0)
  const [quizXp, setQuizXp] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState(null)
  const [timerVal, setTimerVal] = useState(MODE_TIME)
  const [feedback, setFeedback] = useState(null)

  const [speaking, setSpeaking] = useState(false)
  const timerRef = useRef(null)
  const planRef = useRef([])
  const usedTopics = useRef([])

  useEffect(() => () => clearInterval(timerRef.current), [])

  useEffect(() => {
    if (phase === 'playing' && questions[currentQ] && !answered) startTimer()
    return () => clearInterval(timerRef.current)
  }, [currentQ, questions[currentQ], phase])

  const startTimer = () => {
    clearInterval(timerRef.current)
    setTimerVal(MODE_TIME)
    let t = MODE_TIME
    timerRef.current = setInterval(() => {
      t--
      setTimerVal(t)
      if (t <= 0) { clearInterval(timerRef.current); handleTimeUp() }
    }, 1000)
  }

  const loadQuestion = async (idx) => {
    if (idx >= 10) return
    const q = await generateQuestion(planRef.current[idx] === 1, usedTopics.current)
    usedTopics.current.push(q.topic)
    setQuestions(prev => { const next = [...prev]; next[idx] = q; return next })
  }

  const startQuiz = () => {
    clearInterval(timerRef.current)
    const p = [1,1,0,1,1,0,1,1,1,0]
    for (let i = p.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [p[i],p[j]]=[p[j],p[i]] }
    planRef.current = p
    usedTopics.current = []
    setQuestions([])
    setCurrentQ(0)
    setScore(0)
    setQuizCoins(0)
    setQuizXp(0)
    setAnswered(false)
    setSelected(null)
    setTimerVal(MODE_TIME)
    setFeedback(null)
    setPhase('playing')
    loadQuestion(0)
  }

  const handleTimeUp = () => {
    setAnswered(true)
    setQuestions(prev => {
      const q = prev[currentQ]
      setFeedback({ correct: false, text: `⏰ 時間到！${q?.explanation || ''}` })
      return prev
    })
  }

  const handleAnswer = (val) => {
    if (answered) return
    clearInterval(timerRef.current)
    setAnswered(true)
    const q = questions[currentQ]
    if (val === q.answer) {
      setSelected('correct')
      addCoins(10)
      setQuizCoins(c => c + 10)
      addXp(30)
      setQuizXp(x => x + 30)
      setScore(s => s + 1)
      setFeedback({ correct: true, text: `✅ 答對！+10🪙 +30XP\n${q.explanation}` })
    } else {
      setSelected('wrong')
      setFeedback({ correct: false, text: `❌ 答錯了！\n${q.explanation}` })
    }
    if (currentQ + 1 < 10 && !questions[currentQ + 1]) loadQuestion(currentQ + 1)
  }

  const speakQuestion = () => {
    if (!window.speechSynthesis || !q) return
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(`發件人：${q.signal}。${q.text}`)
    u.lang = 'zh-TW'
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
      addXp(bonusXp)
      addCoins(score * 5)
      const playerResult = {
        name: players[playerIdx],
        score,
        coins: quizCoins + score * 5,
        xp: quizXp + bonusXp,
      }
      const newResults = [...results, playerResult]
      if (playerIdx + 1 >= players.length) {
        onDone(newResults)
        return
      }
      setResults(newResults)
      setPlayerIdx(i => i + 1)
      setPhase('handoff')
      clearInterval(timerRef.current)
      return
    }
    setCurrentQ(next)
    setAnswered(false)
    setSelected(null)
    setFeedback(null)
    if (!questions[next]) loadQuestion(next)
  }

  const color = COLORS[playerIdx % COLORS.length]
  const q = questions[currentQ]
  const warn = timerVal <= 5

  if (phase === 'handoff') {
    return (
      <div style={{ padding: 18, position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => navigate('menu')} style={backBtn}>← 返回主選單</button>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: color,
            margin: '0 auto 16px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 30, fontWeight: 800, color: '#fff',
            boxShadow: `0 0 32px ${color}55`,
          }}>{playerIdx + 1}</div>

          <div style={{ fontSize: 12, color: 'rgba(180,200,255,.5)', marginBottom: 5 }}>輪到</div>
          <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 5 }}>
            {players[playerIdx]}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(180,200,255,.4)', marginBottom: 30 }}>
            準備好了嗎？共 10 題，答對得高分！
          </div>

          <button onClick={startQuiz} style={{
            padding: '14px 44px', borderRadius: 14,
            background: `${color}33`, border: `1px solid ${color}99`,
            color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Noto Sans TC,sans-serif', letterSpacing: 1,
          }}>
            🚀 開始！
          </button>

          {results.length > 0 && (
            <div style={{ marginTop: 30, width: 260 }}>
              <div style={{ fontSize: 10, color: 'rgba(140,180,255,.4)', marginBottom: 8, letterSpacing: 1 }}>已完成玩家成績</div>
              {results.map((r, i) => (
                <div key={r.name} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 12px', borderRadius: 9,
                  background: 'rgba(255,255,255,.04)', border: `1px solid ${COLORS[i]}33`,
                  marginBottom: 6, fontSize: 12,
                }}>
                  <span style={{ color: COLORS[i], fontWeight: 600 }}>{r.name}</span>
                  <span style={{ fontFamily: 'Orbitron,monospace', color: '#c8dbff' }}>{r.score}/10</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 18, position: 'relative', zIndex: 2 }}>
      {/* player + timer bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%', background: color, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff',
        }}>{playerIdx + 1}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e0eaff', flex: 1 }}>{players[playerIdx]}</div>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 17, fontWeight: 700, color: warn ? '#ff6b6b' : '#fff', animation: warn ? 'pulse .5s infinite' : '' }}>
          {timerVal}
        </div>
      </div>

      {/* progress */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: 'rgba(180,200,255,.5)', marginBottom: 3 }}>
          第 {currentQ + 1} 題 / 共 10 題　得分 {score}
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,.07)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(currentQ + 1) / 10 * 100}%`, background: `linear-gradient(90deg,${color},${color}88)`, transition: 'width .4s', borderRadius: 4 }} />
        </div>
      </div>

      {/* question card */}
      <div style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${color}33`, borderRadius: 12, padding: 16, marginBottom: 12, minHeight: 95 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <div style={{ fontSize: 10, color: 'rgba(140,180,255,.6)', letterSpacing: 1 }}>
            {q ? `📡 發件人：${q.signal}` : '📡 宇宙訊號偵測中'}
          </div>
          {q && (
            <button onClick={speakQuestion} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: speaking ? 'rgba(91,141,238,.22)' : 'rgba(255,255,255,.05)',
              border: `1px solid ${speaking ? 'rgba(91,141,238,.55)' : 'rgba(91,141,238,.2)'}`,
              borderRadius: 20, padding: '3px 10px', fontSize: 10, cursor: 'pointer',
              color: speaking ? '#a8c4ff' : 'rgba(180,200,255,.45)',
              fontFamily: 'Noto Sans TC,sans-serif', transition: 'all .2s',
            }}>
              {speaking ? '⏹ 停止' : '🔊 朗讀'}
            </button>
          )}
        </div>
        {!q ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(180,200,255,.5)', fontSize: 12 }}>
            <div style={{ width: 14, height: 14, border: '2px solid rgba(91,141,238,.22)', borderTopColor: '#5b8dee', borderRadius: '50%', animation: 'spin .8s linear infinite', flexShrink: 0 }} />
            正在產生題目...
          </div>
        ) : (
          <div style={{ fontSize: 13, lineHeight: 1.75, color: '#e0eaff' }}>{q.text}</div>
        )}
      </div>

      {/* choices */}
      {q && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[{ label: '✅ 這是正常事件', val: 0 }, { label: '🚨 這是異常詐騙', val: 1 }].map((o, i) => {
            let bg = 'rgba(255,255,255,.04)', bc = 'rgba(91,141,238,.2)', col = 'var(--text)'
            if (answered && feedback) {
              if (o.val === q.answer) { bg = 'rgba(50,200,150,.17)'; bc = 'rgba(50,200,150,.55)'; col = '#8ee8c5' }
              else if (selected === 'wrong') { bg = 'rgba(255,80,80,.14)'; bc = 'rgba(255,80,80,.45)'; col = '#ffaaaa' }
            }
            return (
              <button key={o.val} disabled={answered} onClick={() => handleAnswer(o.val)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: bg, border: `1px solid ${bc}`, borderRadius: 11, padding: '12px 15px', color: col,
                fontSize: 13, cursor: answered ? 'default' : 'pointer', textAlign: 'left',
                fontFamily: 'Noto Sans TC,sans-serif', width: '100%',
              }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(91,141,238,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
                  {['A', 'B'][i]}
                </span>
                {o.label}
              </button>
            )
          })}
        </div>
      )}

      {/* feedback */}
      {feedback && (
        <div style={{
          marginTop: 11, padding: '10px 14px', borderRadius: 9, fontSize: 12, lineHeight: 1.6,
          background: feedback.correct ? 'rgba(50,200,150,.11)' : 'rgba(255,100,80,.09)',
          border: `1px solid ${feedback.correct ? 'rgba(50,200,150,.28)' : 'rgba(255,100,80,.25)'}`,
          color: feedback.correct ? '#9ee8c8' : '#ffb3a7',
          whiteSpace: 'pre-line',
        }}>
          {feedback.text}
        </div>
      )}

      {/* next */}
      {feedback && (
        <button onClick={handleNext} style={{
          width: '100%', marginTop: 11, padding: 11,
          background: `${color}2a`, border: `1px solid ${color}77`,
          borderRadius: 11, color: '#c8dbff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          fontFamily: 'Noto Sans TC,sans-serif',
        }}>
          {currentQ + 1 >= 10
            ? (playerIdx + 1 >= players.length ? '查看結果 →' : `換 ${players[playerIdx + 1]} 出場 →`)
            : '下一題 →'}
        </button>
      )}
    </div>
  )
}

const backBtn = {
  position: 'absolute', top: 18, left: 18,
  background: 'none', border: 'none',
  color: 'rgba(180,200,255,.55)', fontSize: 13, cursor: 'pointer',
  fontFamily: 'Noto Sans TC,sans-serif',
}
