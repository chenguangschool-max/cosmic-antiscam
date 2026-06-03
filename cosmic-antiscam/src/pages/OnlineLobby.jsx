import { useState, useEffect, useRef } from 'react'
import { socket } from '../socket'

export default function OnlineLobby({ navigate, onRoomReady }) {
  const [view, setView] = useState('home')   // 'home' | 'waiting' | 'joining' | 'creating'
  const [name, setName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [players, setPlayers] = useState([])
  const [isHost, setIsHost] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // refs avoid stale closure in socket handlers
  const roomCodeRef = useRef('')
  const isHostRef = useRef(false)
  const nameRef = useRef('')

  useEffect(() => { nameRef.current = name }, [name])

  useEffect(() => {
    socket.connect()

    socket.on('connect_error', () => setError('無法連接伺服器，請確認後端已啟動'))

    socket.on('room-joined', ({ code, isHost: host, players: ps }) => {
      roomCodeRef.current = code
      isHostRef.current = host
      setRoomCode(code)
      setIsHost(host)
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
    if (!name.trim()) return setError('請輸入你的名稱')
    const cc = customCode.trim().toUpperCase()
    if (cc && cc.length !== 4) return setError('自訂代碼必須是 4 個字元')
    if (cc && !/^[A-Z0-9]+$/.test(cc)) return setError('代碼只能使用英文字母或數字')
    setError('')
    socket.emit('create-room', { name: name.trim(), customCode: cc || null })
  }

  const handleJoin = () => {
    if (!name.trim()) return setError('請輸入你的名稱')
    if (!joinCode.trim()) return setError('請輸入房間代碼')
    setError('')
    socket.emit('join-room', { code: joinCode.trim(), name: name.trim() })
  }

  const handleStart = () => {
    socket.emit('start-game', { code: roomCode })
  }

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
            <div style={{ fontSize: 10, color: 'rgba(140,180,255,.5)', letterSpacing: 2, marginBottom: 10, textAlign: 'center' }}>
              房間代碼
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {roomCode.split('').map((char, i) => (
                <div key={i} style={{
                  width: 56, height: 64, borderRadius: 10,
                  background: 'rgba(91,141,238,.1)',
                  border: '2px solid rgba(91,141,238,.55)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Orbitron,monospace', fontSize: 28, fontWeight: 900,
                  color: '#5b8dee',
                }}>{char}</div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
              <button onClick={copyCode} style={smallBtn}>
                {copied ? '✅ 已複製' : '複製代碼'}
              </button>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(180,200,255,.4)', marginTop: 8 }}>
            把代碼分享給朋友，他們輸入後就能加入
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: 'rgba(140,180,255,.55)', letterSpacing: 1, marginBottom: 9 }}>
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
                fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>{i + 1}</div>
              <span style={{ color: '#e0eaff', fontSize: 13 }}>{p.name}</span>
              {i === 0 && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(91,141,238,.7)' }}>房主</span>}
            </div>
          ))}
        </div>

        {error && <div style={errBox}>{error}</div>}

        {isHost ? (
          <button
            onClick={handleStart}
            disabled={players.length < 2}
            style={{
              width: '100%', padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 600,
              fontFamily: 'Noto Sans TC,sans-serif', letterSpacing: 1, cursor: players.length < 2 ? 'not-allowed' : 'pointer',
              background: players.length < 2 ? 'rgba(255,255,255,.05)' : 'rgba(91,141,238,.22)',
              border: `1px solid ${players.length < 2 ? 'rgba(255,255,255,.1)' : 'rgba(91,141,238,.6)'}`,
              color: players.length < 2 ? 'rgba(180,200,255,.3)' : '#c8dbff',
            }}
          >
            {players.length < 2 ? '等待更多玩家加入…' : '🚀 開始對戰！'}
          </button>
        ) : (
          <div style={{ textAlign: 'center', color: 'rgba(180,200,255,.45)', fontSize: 13 }}>
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
        <div style={{ fontSize: 12, color: 'rgba(180,200,255,.45)', marginTop: 5 }}>
          與朋友即時連線，同步答題比拼防詐能力
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: 'rgba(140,180,255,.55)', letterSpacing: 1, marginBottom: 7 }}>你的名稱</div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder='輸入名稱…'
          maxLength={10}
          style={inputStyle}
        />
      </div>

      {view === 'creating' && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: 'rgba(140,180,255,.55)', letterSpacing: 1, marginBottom: 7 }}>自訂房間代碼（選填）</div>
          <input
            value={customCode}
            onChange={e => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder='留空則自動產生'
            maxLength={4}
            style={{ ...inputStyle, fontFamily: 'Orbitron,monospace', fontSize: 22, textAlign: 'center', letterSpacing: 6 }}
          />
          <div style={{ fontSize: 12, color: 'rgba(140,180,255,.4)', marginTop: 6 }}>
            可輸入 4 個英數字，方便朋友記住
          </div>
        </div>
      )}

      {view === 'joining' && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: 'rgba(140,180,255,.55)', letterSpacing: 1, marginBottom: 7 }}>房間代碼</div>
          <input
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder='輸入 4 位代碼…'
            maxLength={4}
            style={{ ...inputStyle, fontFamily: 'Orbitron,monospace', fontSize: 22, textAlign: 'center', letterSpacing: 6 }}
          />
        </div>
      )}

      {error && <div style={errBox}>{error}</div>}

      {view === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => { setView('creating'); setError('') }} style={primaryBtn}>🏠 建立房間</button>
          <button onClick={() => { setView('joining'); setError('') }} style={secondaryBtn}>🔗 加入房間</button>
        </div>
      )}
      {view === 'creating' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={handleCreate} style={primaryBtn}>🏠 建立</button>
          <button onClick={() => { setView('home'); setCustomCode(''); setError('') }} style={secondaryBtn}>← 返回</button>
        </div>
      )}
      {view === 'joining' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={handleJoin} style={primaryBtn}>🚀 加入</button>
          <button onClick={() => { setView('home'); setError('') }} style={secondaryBtn}>← 返回</button>
        </div>
      )}
    </div>
  )
}

const page = { padding: 18, position: 'relative', zIndex: 2, minHeight: '100vh' }
const title = { fontFamily: 'Orbitron,monospace', fontSize: 17, fontWeight: 900, color: '#fff', letterSpacing: 2 }
const backBtn = { background: 'none', border: 'none', color: 'rgba(180,200,255,.55)', fontSize: 13, cursor: 'pointer', padding: '0 0 18px', fontFamily: 'Noto Sans TC,sans-serif' }
const inputStyle = { width: '100%', padding: '10px 13px', borderRadius: 9, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(91,141,238,.22)', color: '#e0eaff', fontSize: 14, fontFamily: 'Noto Sans TC,sans-serif', outline: 'none', boxSizing: 'border-box' }
const primaryBtn = { width: '100%', padding: 14, borderRadius: 12, background: 'rgba(91,141,238,.22)', border: '1px solid rgba(91,141,238,.6)', color: '#c8dbff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif', letterSpacing: 1 }
const secondaryBtn = { width: '100%', padding: 14, borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(180,200,255,.6)', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif' }
const smallBtn = { padding: '4px 12px', borderRadius: 8, background: 'rgba(91,141,238,.18)', border: '1px solid rgba(91,141,238,.4)', color: '#c8dbff', fontSize: 11, cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif' }
const errBox = { background: 'rgba(255,80,80,.1)', border: '1px solid rgba(255,80,80,.28)', borderRadius: 8, padding: '8px 12px', color: '#ffaaaa', fontSize: 12, marginBottom: 12 }
