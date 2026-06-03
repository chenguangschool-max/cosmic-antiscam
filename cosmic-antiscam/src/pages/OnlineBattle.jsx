import { useState, useEffect, useRef } from 'react'
import { socket } from '../socket'

const COLORS = ['#5b8dee', '#a78bfa', '#34d399', '#fb923c', '#ff6b6b']

export default function OnlineBattle({ room, navigate }) {
  const [phase, setPhase] = useState('generating') // generating | question | result | gameover | error
  const [genError, setGenError] = useState('')
  const [q, setQ] = useState(null)
  const [qIndex, setQIndex] = useState(0)
  const [total, setTotal] = useState(10)
  const [timer, setTimer] = useState(20)
  const [myAnswer, setMyAnswer] = useState(null)   // null | 0 | 1
  const [questionResult, setQuestionResult] = useState(null)
  const [scores, setScores] = useState([])
  const [finalResults, setFinalResults] = useState(null)
  const [speaking, setSpeaking] = useState(false)

  const timerRef = useRef(null)

  useEffect(() => {
    socket.on('game-start', ({ total: t }) => {
      setTotal(t)
      setPhase('question')
    })

    socket.on('new-question', ({ index, total: t, signal, text, timeLimit }) => {
      window.speechSynthesis?.cancel()
      setSpeaking(false)
      setQ({ signal, text })
      setQIndex(index)
      setTotal(t)
      setMyAnswer(null)
      setQuestionResult(null)
      setPhase('question')
      startTimer(timeLimit)
    })

    socket.on('question-result', ({ correctAnswer, explanation, playerAnswers, scores: s }) => {
      clearTimer()
      setQuestionResult({ correctAnswer, explanation, playerAnswers })
      setScores(s)
      setPhase('result')
    })

    socket.on('gen-error', (msg) => { setGenError(msg); setPhase('error') })

    socket.on('game-over', ({ results }) => {
      clearTimer()
      setFinalResults(results)
      setPhase('gameover')
    })

    socket.on('room-update', ({ players }) => {
      setScores(prev => {
        const names = new Set(players.map(p => p.name))
        return prev.filter(s => names.has(s.name))
      })
    })

    return () => {
      socket.off('gen-error')
      socket.off('game-start')
      socket.off('new-question')
      socket.off('question-result')
      socket.off('game-over')
      socket.off('room-update')
    }
  }, [])

  const startTimer = (seconds) => {
    clearTimer()
    setTimer(seconds)
    let t = seconds
    timerRef.current = setInterval(() => {
      t--
      setTimer(t)
      if (t <= 0) clearTimer()
    }, 1000)
  }

  const clearTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = null
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

  const handleAnswer = (val) => {
    if (myAnswer !== null || phase !== 'question') return
    setMyAnswer(val)
    socket.emit('submit-answer', { code: room.code, val })
  }

  // ── 生成題目中 ──────────────────────────────────────────────────────────────
  if (phase === 'generating') {
    return (
      <div style={{ ...page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 18 }}>🤖</div>
        <div style={titleStyle}>AI 正在生成題目</div>
        <div style={{ color: 'rgba(180,200,255,.4)', fontSize: 12, marginTop: 8 }}>宇宙情報收集中，約需 30 秒…</div>
        <div style={{ marginTop: 24, display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%', background: '#5b8dee',
              animation: `pulse 1s ease-in-out ${i * 0.3}s infinite`,
            }} />
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div style={{ ...page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 18 }}>⚠️</div>
        <div style={titleStyle}>生成失敗</div>
        <div style={{ color: 'rgba(255,150,150,.7)', fontSize: 13, marginTop: 8, textAlign: 'center' }}>{genError}</div>
        <button onClick={() => { socket.disconnect(); navigate('menu') }} style={{ ...actionBtn, marginTop: 24 }}>返回主選單</button>
      </div>
    )
  }

  // ── 遊戲結束 ─────────────────────────────────────────────────────────────────
  if (phase === 'gameover' && finalResults) {
    const medals = ['🥇', '🥈', '🥉']
    return (
      <div style={page}>
        <div style={{ textAlign: 'center', marginBottom: 26, paddingTop: 20 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🏆</div>
          <div style={titleStyle}>最終結果</div>
          <div style={{ fontSize: 12, color: 'rgba(180,200,255,.4)', marginTop: 5 }}>共 {total} 題</div>
        </div>

        {finalResults.map((r, i) => (
          <div key={r.name} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '13px 16px', borderRadius: 12, marginBottom: 9,
            background: i === 0 ? 'rgba(255,210,50,.09)' : 'rgba(255,255,255,.04)',
            border: `1px solid ${i === 0 ? 'rgba(255,210,50,.35)' : COLORS[i % COLORS.length] + '33'}`,
          }}>
            <span style={{ fontSize: 22, width: 32, textAlign: 'center' }}>{medals[i] || `${i + 1}`}</span>
            <span style={{ flex: 1, color: '#e0eaff', fontSize: 14, fontWeight: i === 0 ? 700 : 400 }}>{r.name}</span>
            <span style={{ fontFamily: 'Orbitron,monospace', color: COLORS[i % COLORS.length], fontSize: 16, fontWeight: 700 }}>
              {r.score}<span style={{ fontSize: 10, color: 'rgba(180,200,255,.4)', marginLeft: 2 }}>/{total}</span>
            </span>
          </div>
        ))}

        <button onClick={() => { socket.disconnect(); navigate('menu') }} style={{ ...actionBtn, marginTop: 16 }}>
          返回主選單
        </button>
      </div>
    )
  }

  // ── 答題中 / 揭曉結果 ────────────────────────────────────────────────────────
  const warn = timer <= 5
  const myCorrect = questionResult ? myAnswer === questionResult.correctAnswer : null
  const notAnswered = questionResult && myAnswer === null

  return (
    <div style={page}>
      {/* 頂部：進度 + 計時 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, fontSize: 11, color: 'rgba(180,200,255,.5)' }}>
          第 {qIndex + 1} 題 / 共 {total} 題
        </div>
        {phase === 'question' && (
          <div style={{
            fontFamily: 'Orbitron,monospace', fontSize: 19, fontWeight: 700,
            color: warn ? '#ff6b6b' : '#fff',
            animation: warn ? 'pulse .5s infinite' : '',
          }}>
            {timer}
          </div>
        )}
      </div>

      {/* 進度條 */}
      <div style={{ height: 3, background: 'rgba(255,255,255,.07)', borderRadius: 3, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(qIndex + 1) / total * 100}%`, background: 'linear-gradient(90deg,#5b8dee,#a78bfa)', borderRadius: 3, transition: 'width .4s' }} />
      </div>

      {/* 題目卡 */}
      {q && (
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(91,141,238,.22)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <div style={{ fontSize: 10, color: 'rgba(140,180,255,.55)', letterSpacing: 1 }}>
              📡 {q.signal}
            </div>
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
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.8, color: '#e0eaff' }}>{q.text}</div>
        </div>
      )}

      {/* 選項 */}
      {q && phase !== 'result' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[{ label: '✅ 這是正常事件', val: 0 }, { label: '🚨 這是異常詐騙', val: 1 }].map((o, i) => {
            const selected = myAnswer === o.val
            return (
              <button key={o.val} onClick={() => handleAnswer(o.val)} disabled={myAnswer !== null} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                background: selected ? 'rgba(91,141,238,.2)' : 'rgba(255,255,255,.04)',
                border: `1px solid ${selected ? 'rgba(91,141,238,.7)' : 'rgba(91,141,238,.2)'}`,
                borderRadius: 11, padding: '12px 15px', color: selected ? '#c8dbff' : 'var(--text)',
                fontSize: 13, cursor: myAnswer !== null ? 'default' : 'pointer', textAlign: 'left',
                fontFamily: 'Noto Sans TC,sans-serif',
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

      {/* 等待其他人 */}
      {myAnswer !== null && phase === 'question' && (
        <div style={{ textAlign: 'center', color: 'rgba(180,200,255,.45)', fontSize: 12, marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#5b8dee', animation: `pulse 1s ease-in-out ${i * 0.3}s infinite` }} />
            ))}
          </div>
          等待其他玩家…
        </div>
      )}

      {/* 揭曉結果 */}
      {phase === 'result' && questionResult && (
        <>
          {/* 正確答案 highlight */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
            {[{ label: '✅ 這是正常事件', val: 0 }, { label: '🚨 這是異常詐騙', val: 1 }].map((o, i) => {
              const isCorrect = o.val === questionResult.correctAnswer
              const isMine = myAnswer === o.val
              let bg = 'rgba(255,255,255,.04)', bc = 'rgba(91,141,238,.2)', col = 'var(--text)'
              if (isCorrect) { bg = 'rgba(50,200,150,.17)'; bc = 'rgba(50,200,150,.55)'; col = '#8ee8c5' }
              else if (isMine) { bg = 'rgba(255,80,80,.14)'; bc = 'rgba(255,80,80,.45)'; col = '#ffaaaa' }
              return (
                <div key={o.val} style={{ display: 'flex', alignItems: 'center', gap: 10, background: bg, border: `1px solid ${bc}`, borderRadius: 11, padding: '12px 15px', color: col, fontSize: 13 }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(91,141,238,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
                    {['A', 'B'][i]}
                  </span>
                  {o.label}
                </div>
              )
            })}
          </div>

          {/* 我的結果 */}
          <div style={{
            padding: '9px 14px', borderRadius: 9, fontSize: 12, lineHeight: 1.6, marginBottom: 10,
            background: notAnswered ? 'rgba(255,210,50,.08)' : myCorrect ? 'rgba(50,200,150,.11)' : 'rgba(255,100,80,.09)',
            border: `1px solid ${notAnswered ? 'rgba(255,210,50,.25)' : myCorrect ? 'rgba(50,200,150,.28)' : 'rgba(255,100,80,.25)'}`,
            color: notAnswered ? '#ffd27a' : myCorrect ? '#9ee8c8' : '#ffb3a7',
          }}>
            {notAnswered ? '⏰ 未作答' : myCorrect ? '✅ 答對！' : '❌ 答錯了'}
            {' '}{questionResult.explanation}
          </div>

          {/* 玩家作答狀況 */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: 'rgba(140,180,255,.45)', letterSpacing: 1, marginBottom: 6 }}>玩家作答</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {questionResult.playerAnswers.map((p, i) => (
                <div key={p.name} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 20, fontSize: 11,
                  background: 'rgba(255,255,255,.04)', border: `1px solid ${COLORS[i % COLORS.length]}33`,
                  color: COLORS[i % COLORS.length],
                }}>
                  {p.correct === null ? '⏰' : p.correct ? '✅' : '❌'} {p.name}
                </div>
              ))}
            </div>
          </div>

          {/* 即時排行 */}
          <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(91,141,238,.15)', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 10, color: 'rgba(140,180,255,.45)', letterSpacing: 1, marginBottom: 8 }}>即時排行</div>
            {scores.map((s, i) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, fontSize: 12 }}>
                <span style={{ width: 18, color: 'rgba(180,200,255,.35)', fontFamily: 'Orbitron,monospace', fontSize: 10 }}>{i + 1}</span>
                <span style={{ flex: 1, color: '#e0eaff' }}>{s.name}</span>
                <span style={{ fontFamily: 'Orbitron,monospace', color: COLORS[i % COLORS.length], fontWeight: 700 }}>{s.score}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', color: 'rgba(180,200,255,.35)', fontSize: 11, marginTop: 10 }}>
            {qIndex + 1 < total ? '下一題即將開始…' : '結算中…'}
          </div>
        </>
      )}
    </div>
  )
}

const page = { padding: 18, position: 'relative', zIndex: 2, minHeight: '100vh' }
const titleStyle = { fontFamily: 'Orbitron,monospace', fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 2 }
const actionBtn = { width: '100%', padding: 14, borderRadius: 12, background: 'rgba(91,141,238,.22)', border: '1px solid rgba(91,141,238,.6)', color: '#c8dbff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif', letterSpacing: 1 }
