import { useState, useEffect } from 'react'
import { EDU_TIPS } from '../data'

const SERVER = 'https://cosmic-antiscam-production.up.railway.app'

function todayLabel() {
  return new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
function todayKey() {
  return new Date().toISOString().slice(0, 10)
}
function loadNotes() {
  try { return JSON.parse(localStorage.getItem('cosmicDiaryNotes') || '{}') } catch { return {} }
}

export default function NoteBook({ navigate, dailyTip }) {
  const key = todayKey()
  const tipData = dailyTip ? EDU_TIPS[dailyTip] : null
  const notes = loadNotes()

  const [todayNote, setTodayNote] = useState(notes[key] || null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [showPast, setShowPast] = useState(false)

  const pastEntries = Object.entries(notes)
    .filter(([k]) => k !== key)
    .sort((a, b) => b[0].localeCompare(a[0]))

  useEffect(() => {
    if (todayNote || !dailyTip) return
    generateNote()
  }, [dailyTip])

  const generateNote = async () => {
    if (!dailyTip) return
    setLoading(true)
    setErr('')
    try {
      const res = await fetch(`${SERVER}/api/generate-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: dailyTip, date: todayLabel() }),
      })
      const data = await res.json()
      if (data.note) {
        const entry = { note: data.note, topic: dailyTip, date: todayLabel() }
        const all = loadNotes()
        all[key] = entry
        localStorage.setItem('cosmicDiaryNotes', JSON.stringify(all))
        setTodayNote(entry)
      } else {
        setErr('生成失敗，請稍後再試')
      }
    } catch {
      setErr('連線失敗，請稍後再試')
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '18px 18px 32px', position: 'relative', zIndex: 2, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={() => navigate('menu')} style={{
          background: 'none', border: 'none', color: 'rgba(140,180,255,.6)',
          fontSize: 22, cursor: 'pointer', padding: 0, lineHeight: 1,
        }}>←</button>
        <div>
          <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>
            📒 防詐筆記
          </div>
          <div style={{ fontSize: 12, color: 'rgba(180,200,255,.4)', marginTop: 2 }}>{todayLabel()}</div>
        </div>
      </div>

      {/* 今日手法標題卡 */}
      {tipData && (
        <div style={{
          padding: '12px 14px', borderRadius: 12, marginBottom: 14,
          background: 'rgba(255,120,60,.07)', border: '1px solid rgba(255,120,60,.25)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>🚨</span>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,140,80,.6)', fontWeight: 700, marginBottom: 3 }}>今日主題</div>
            <div style={{ fontSize: 14, color: '#fff4ec', fontWeight: 700 }}>{dailyTip}</div>
          </div>
        </div>
      )}

      {/* AI 生成筆記 */}
      <div style={{
        padding: '16px', borderRadius: 14, marginBottom: 16,
        background: 'rgba(91,141,238,.06)', border: '1px solid rgba(91,141,238,.2)',
        minHeight: 160,
      }}>
        <div style={{ fontSize: 13, color: 'rgba(140,180,255,.6)', fontWeight: 700, marginBottom: 12 }}>
          ✨ 今日防詐筆記
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(140,180,255,.4)', fontSize: 14 }}>
            <div style={{ fontSize: 28, marginBottom: 10, animation: 'float 1.5s ease-in-out infinite' }}>✨</div>
            AI 正在生成今日筆記…
          </div>
        ) : err ? (
          <div style={{ color: '#ffaaaa', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
            {err}
            <br />
            <button onClick={generateNote} style={{
              marginTop: 12, background: 'rgba(91,141,238,.15)', border: '1px solid rgba(91,141,238,.3)',
              borderRadius: 8, color: '#a8c4ff', fontSize: 13, cursor: 'pointer',
              padding: '8px 20px', fontFamily: 'Noto Sans TC,sans-serif',
            }}>再試一次</button>
          </div>
        ) : todayNote ? (
          <div style={{ fontSize: 15, color: 'rgba(200,220,255,.9)', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
            {todayNote.note}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(140,180,255,.35)', fontSize: 14 }}>
            {dailyTip ? '等待生成…' : '載入今日主題中…'}
          </div>
        )}
      </div>

      {/* 過去的筆記 */}
      {pastEntries.length > 0 && (
        <div>
          <button onClick={() => setShowPast(p => !p)} style={{
            background: 'none', border: 'none', color: 'rgba(140,180,255,.45)',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Noto Sans TC,sans-serif', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 6, padding: 0,
          }}>
            {showPast ? '▾' : '▸'} 過去的筆記（{pastEntries.length} 篇）
          </button>

          {showPast && pastEntries.map(([k, v]) => (
            <div key={k} style={{
              padding: '12px 14px', borderRadius: 12, marginBottom: 8,
              background: 'rgba(91,141,238,.04)', border: '1px solid rgba(91,141,238,.13)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'rgba(140,180,255,.4)' }}>{v.date}</span>
                {v.topic && <span style={{ fontSize: 11, color: 'rgba(255,140,80,.5)' }}>{v.topic}</span>}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(180,200,255,.7)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{v.note}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
