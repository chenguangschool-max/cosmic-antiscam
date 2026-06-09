import { useState, useEffect, useRef } from 'react'
import { socket } from '../socket'

function CodeBoxes({ chars, onChange }) {
  const refs = [useRef(), useRef(), useRef(), useRef()]
  const [shake, setShake] = useState(null)
  const flash = (i) => { setShake(i); setTimeout(() => setShake(null), 400) }

  const commit = (i, ch) => {
    if ('IO01'.includes(ch)) { flash(i); return }
    if (!/^[A-Z2-9]$/.test(ch)) return
    onChange(chars.map((c, idx) => idx === i ? ch : c))
    if (i < 3) setTimeout(() => refs[i + 1].current?.focus(), 10)
  }

  // onChange 處理手機鍵盤（e.key 在手機上是 'Unidentified'）
  const handleChange = (i, e) => {
    const v = e.target.value.toUpperCase()
    if (!v) { onChange(chars.map((c, idx) => idx === i ? '' : c)); return }
    const ch = v.replace(chars[i] || '', '').slice(-1) || v.slice(-1)
    commit(i, ch)
  }

  // onKeyDown 處理桌機的 Backspace 跨格導航
  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      if (chars[i]) onChange(chars.map((c, idx) => idx === i ? '' : c))
      else if (i > 0) { onChange(chars.map((c, idx) => idx === i - 1 ? '' : c)); refs[i - 1].current?.focus() }
      return
    }
    if (e.key.length === 1) commit(i, e.key.toUpperCase())
  }

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <input
            ref={refs[i]}
            value={chars[i]}
            onChange={e => handleChange(i, e)}
            onKeyDown={e => handleKey(i, e)}
            maxLength={2}
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            style={{
              width: 62, height: 72, borderRadius: 12, textAlign: 'center',
              background: shake === i ? 'rgba(255,80,80,.18)' : chars[i] ? 'rgba(91,141,238,.18)' : 'rgba(255,255,255,.05)',
              border: `2px solid ${shake === i ? 'rgba(255,80,80,.7)' : chars[i] ? 'rgba(91,141,238,.7)' : 'rgba(91,141,238,.25)'}`,
              fontFamily: "'Courier New', Courier, monospace", fontSize: 34, fontWeight: 700,
              color: shake === i ? '#ff9999' : '#7eb8ff', outline: 'none', cursor: 'text',
              caretColor: 'transparent', boxSizing: 'border-box',
              transition: 'border-color .15s, background .15s, color .15s',
            }}
          />
          {shake === i && (
            <div style={{ fontSize: 11, color: '#ff9999', whiteSpace: 'nowrap' }}>不可用</div>
          )}
        </div>
      ))}
    </div>
  )
}

const MODE_OPTIONS = [
  { id: 'quiz',     emoji: '🚀', label: '答題模式',   desc: '判斷詐騙或正常' },
  { id: 'detective',emoji: '🔍', label: '偵探模式',   desc: '找出情境中的陷阱' },
  { id: 'lifesim',  emoji: '🎭', label: '人生模擬器', desc: '選擇行動保住資產' },
]

export default function OnlineLobby({ navigate, onRoomReady }) {
  const [view, setView] = useState('home')
  const name = localStorage.getItem('playerName') || '玩家'
  const [gameMode, setGameMode] = useState('quiz')
  const [roomMode, setRoomMode] = useState('quiz')
  const [joinChars, setJoinChars] = useState(['', '', '', ''])
  const [roomCode, setRoomCode] = useState('')
  const [players, setPlayers] = useState([])
  const [isHost, setIsHost] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const roomCodeRef = useRef('')
  const isHostRef = useRef(false)
  const nameRef = useRef('')

  useEffect(() => { nameRef.current = name }, [name])

  useEffect(() => {
    socket.connect()
    socket.on('connect_error', () => setError('無法連接伺服器，請確認後端已啟動'))
    socket.on('room-joined', ({ code, isHost: host, mode, players: ps }) => {
      roomCodeRef.current = code
      isHostRef.current = host
      setRoomCode(code)
      setIsHost(host)
      setRoomMode(mode || 'quiz')
      setPlayers(ps)
      setError('')
      setView('waiting')
    })
    socket.on('room-update', ({ players: ps }) => setPlayers(ps))
    socket.on('join-error', (msg) => setError(msg))
    socket.on('game-generating', () => {
      onRoomReady({ code: roomCodeRef.current, isHost: isHostRef.current, playerName: nameRef.current })
      navigate('onlineBattle')
    })
    socket.on('gen-error', (msg) => setError(msg))
    return () => {
      socket.off('connect_error')
      socket.off('room-joined')
      socket.off('room-update')
      socket.off('join-error')
      socket.off('game-generating')
      socket.off('gen-error')
    }
  }, [])

  const handleCreate = () => {
    setError('')
    socket.emit('create-room', { name, mode: gameMode })
  }

  const handleJoin = () => {
    const code = joinChars.join('')
    if (code.length !== 4) return setError('請填滿 4 格代碼')
    setError('')
    socket.emit('join-room', { code, name })
  }

  const handleStart = () => socket.emit('start-game', { code: roomCode })

  const copyCode = () => {
    navigator.clipboard?.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const COLORS = ['#5b8dee', '#a78bfa', '#34d399', '#fb923c']

  if (view === 'waiting') {
    return (
      <div style={page}>
        <button onClick={() => { socket.disconnect(); navigate('menu') }} style={backBtn}>← 返回</button>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🛸</div>
          <div style={title}>等待玩家加入</div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: 'rgba(140,180,255,.5)', letterSpacing: 2, marginBottom: 10 }}>房間代碼</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', cursor: 'pointer' }} onClick={copyCode} title="點擊複製">
              {roomCode.split('').map((char, i) => (
                <div key={i} style={{
                  width: 62, height: 72, borderRadius: 12,
                  background: 'rgba(91,141,238,.1)',
                  border: '2px solid rgba(91,141,238,.55)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Courier New', Courier, monospace", fontSize: 34, fontWeight: 700,
                  color: '#5b8dee',
                }}>{char}</div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              <button onClick={copyCode} style={{
                padding: '10px 28px', borderRadius: 10,
                background: copied ? 'rgba(50,200,150,.22)' : 'rgba(91,141,238,.22)',
                border: `1px solid ${copied ? 'rgba(50,200,150,.6)' : 'rgba(91,141,238,.6)'}`,
                color: copied ? '#7ee8c5' : '#c8dbff',
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Noto Sans TC,sans-serif', letterSpacing: 1,
                transition: 'all .2s',
              }}>
                {copied ? '✅ 已複製！' : '📋 複製代碼'}
              </button>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(180,200,255,.4)', marginTop: 8 }}>
            把代碼分享給朋友，他們輸入後就能加入
          </div>
        </div>

        {/* 模式顯示 */}
        {(() => { const m = MODE_OPTIONS.find(o => o.id === roomMode); return m ? (
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:10, background:'rgba(91,141,238,.08)', border:'1px solid rgba(91,141,238,.2)', marginBottom:16 }}>
            <span style={{ fontSize:18 }}>{m.emoji}</span>
            <div><div style={{ fontSize:13, color:'#c8dbff', fontWeight:600 }}>{m.label}</div><div style={{ fontSize:11, color:'rgba(140,180,255,.5)' }}>{m.desc}</div></div>
          </div>
        ) : null })()}

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 13, color: 'rgba(140,180,255,.55)', letterSpacing: 1, marginBottom: 9 }}>
            玩家 {players.length}/4
          </div>
          {players.map((p, i) => (
            <div key={p.name + i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 10, marginBottom: 7,
              background: 'rgba(255,255,255,.04)', border: `1px solid ${COLORS[i]}33`,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: COLORS[i],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>{i + 1}</div>
              <span style={{ color: '#e0eaff', fontSize: 15 }}>{p.name}</span>
              {i === 0 && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(91,141,238,.7)' }}>房主</span>}
            </div>
          ))}
        </div>

        {error && <div style={errBox}>{error}</div>}

        {isHost ? (
          <button onClick={handleStart} disabled={players.length < 2} style={{
            width: '100%', padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 600,
            fontFamily: 'Noto Sans TC,sans-serif', letterSpacing: 1,
            cursor: players.length < 2 ? 'not-allowed' : 'pointer',
            background: players.length < 2 ? 'rgba(255,255,255,.05)' : 'rgba(91,141,238,.22)',
            border: `1px solid ${players.length < 2 ? 'rgba(255,255,255,.1)' : 'rgba(91,141,238,.6)'}`,
            color: players.length < 2 ? 'rgba(180,200,255,.3)' : '#c8dbff',
          }}>
            {players.length < 2 ? '等待更多玩家加入…' : '🚀 開始對戰！'}
          </button>
        ) : (
          <div style={{ textAlign: 'center', color: 'rgba(180,200,255,.45)', fontSize: 14 }}>
            等待房主開始遊戲…
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={page}>
      <button onClick={() => { socket.disconnect(); navigate('menu') }} style={backBtn}>← 返回</button>

      <div style={{ textAlign: 'center', marginBottom: 26 }}>
        <div style={{ fontSize: 42, marginBottom: 8 }}>🌐</div>
        <div style={title}>連線對戰</div>
        <div style={{ fontSize: 13, color: 'rgba(180,200,255,.45)', marginTop: 5 }}>
          與朋友即時連線，同步答題比拼防詐能力
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderRadius: 10, marginBottom: 20,
        background: 'rgba(91,141,238,.08)', border: '1px solid rgba(91,141,238,.2)',
      }}>
        <span style={{ fontSize: 20 }}>🧑‍🚀</span>
        <div>
          <div style={{ fontSize: 12, color: 'rgba(140,180,255,.5)', marginBottom: 2 }}>參賽名稱</div>
          <div style={{ fontSize: 16, color: '#c8dbff', fontWeight: 600 }}>{name}</div>
        </div>
      </div>

      {view === 'joining' && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 13, color: 'rgba(140,180,255,.55)', letterSpacing: 1, marginBottom: 12 }}>
            輸入房間代碼
          </div>
          <CodeBoxes chars={joinChars} onChange={setJoinChars} />
        </div>
      )}

      {error && <div style={errBox}>{error}</div>}

      {view === 'home' && (
        <>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'rgba(140,180,255,.5)', letterSpacing: 1, marginBottom: 8 }}>選擇遊戲模式</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {MODE_OPTIONS.map(m => (
                <button key={m.id} onClick={() => setGameMode(m.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderRadius: 11,
                  background: gameMode === m.id ? 'rgba(91,141,238,.2)' : 'rgba(255,255,255,.04)',
                  border: `1px solid ${gameMode === m.id ? 'rgba(91,141,238,.7)' : 'rgba(91,141,238,.15)'}`,
                  color: gameMode === m.id ? '#c8dbff' : 'rgba(180,200,255,.55)',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'Noto Sans TC,sans-serif',
                }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{m.emoji}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: gameMode === m.id ? 600 : 400 }}>{m.label}</div>
                    <div style={{ fontSize: 11, opacity: .6, marginTop: 1 }}>{m.desc}</div>
                  </div>
                  {gameMode === m.id && <span style={{ marginLeft: 'auto', fontSize: 14 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={handleCreate} style={primaryBtn}>🏠 建立房間</button>
            <button onClick={() => { setView('joining'); setError('') }} style={secondaryBtn}>🔗 加入房間</button>
          </div>
        </>
      )}
      {view === 'joining' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={handleJoin} style={primaryBtn}>🚀 加入</button>
          <button onClick={() => { setView('home'); setJoinChars(['','','','']); setError('') }} style={secondaryBtn}>← 返回</button>
        </div>
      )}
    </div>
  )
}

const page = { padding: 18, position: 'relative', zIndex: 2, minHeight: '100vh' }
const title = { fontFamily: 'Orbitron,monospace', fontSize: 17, fontWeight: 900, color: '#fff', letterSpacing: 2 }
const backBtn = { background: 'none', border: 'none', color: 'rgba(180,200,255,.55)', fontSize: 13, cursor: 'pointer', padding: '0 0 18px', fontFamily: 'Noto Sans TC,sans-serif' }
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 9, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(91,141,238,.22)', color: '#e0eaff', fontSize: 16, fontFamily: 'Noto Sans TC,sans-serif', outline: 'none', boxSizing: 'border-box' }
const primaryBtn = { width: '100%', padding: 15, borderRadius: 12, background: 'rgba(91,141,238,.22)', border: '1px solid rgba(91,141,238,.6)', color: '#c8dbff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif', letterSpacing: 1 }
const secondaryBtn = { width: '100%', padding: 15, borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(180,200,255,.6)', fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif' }
const errBox = { background: 'rgba(255,80,80,.1)', border: '1px solid rgba(255,80,80,.28)', borderRadius: 8, padding: '10px 14px', color: '#ffaaaa', fontSize: 14, marginBottom: 12 }
