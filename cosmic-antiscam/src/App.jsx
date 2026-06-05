import { useState, useEffect, useRef } from 'react'
import { GameProvider } from './GameContext'
import Stars from './components/Stars'
import Toast from './components/Toast'
import Instructions from './pages/Instructions'
import ProfileSetup from './pages/ProfileSetup'
import AdminPanel from './pages/AdminPanel'
import MainMenu from './pages/MainMenu'
import ModeSelect from './pages/ModeSelect'
import Quiz from './pages/Quiz'
import Result from './pages/Result'
import Codex from './pages/Codex'
import Shop from './pages/Shop'
import MultiSetup from './pages/MultiSetup'
import MultiQuiz from './pages/MultiQuiz'
import MultiResult from './pages/MultiResult'
import OnlineLobby from './pages/OnlineLobby'
import OnlineBattle from './pages/OnlineBattle'

const SERVER = 'https://cosmic-antiscam-production.up.railway.app'
const ADMIN_SECRET = 'cosmic888'

function checkAdmin() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('admin') === ADMIN_SECRET) {
    localStorage.setItem('isAdmin', '1')
    window.history.replaceState({}, '', window.location.pathname)
  }
  return localStorage.getItem('isAdmin') === '1'
}

function getStep(serverVersion) {
  const localVersion = localStorage.getItem('cosmicVersion')
  if (String(serverVersion) !== String(localVersion)) return 'instructions'
  if (!localStorage.getItem('cosmicReady_v9')) return 'instructions'
  return 'ready'
}

export default function App() {
  const [step, setStep] = useState('instructions')
  const [serverVersion, setServerVersion] = useState(null)
  const [gameOpen, setGameOpen] = useState(false)
  const [playerCount, setPlayerCount] = useState(0)
  const [dailyTip, setDailyTip] = useState(null)
  const [remainingTips, setRemainingTips] = useState(null)
  const [totalTips, setTotalTips] = useState(null)
  const [toggling, setToggling] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [isAdmin] = useState(checkAdmin)
  const [broadcastBanner, setBroadcastBanner] = useState('')
  const lastBroadcastRef = useRef('')
  const [page, setPage] = useState('menu')
  const [currentMode, setCurrentMode] = useState(null)
  const [quizResult, setQuizResult] = useState(null)
  const [multiPlayers, setMultiPlayers] = useState([])
  const [multiResults, setMultiResults] = useState([])
  const [onlineRoom, setOnlineRoom] = useState(null)

  const navigate = (p) => setPage(p)

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${SERVER}/api/status`)
      const data = await res.json()
      if (data.open !== undefined) setGameOpen(data.open)
      if (data.playerCount !== undefined) setPlayerCount(data.playerCount)
      if (data.dailyTip !== undefined) setDailyTip(data.dailyTip)
      if (data.remainingTips !== undefined) setRemainingTips(data.remainingTips)
      if (data.totalTips !== undefined) setTotalTips(data.totalTips)
      if (data.broadcast !== undefined) {
        const incoming = data.broadcast
        if (incoming !== lastBroadcastRef.current) {
          lastBroadcastRef.current = incoming
          setBroadcastBanner(incoming)
        }
      }
      if (data.version !== undefined) {
        const local = localStorage.getItem('cosmicVersion')
        if (String(data.version) !== String(local)) {
          localStorage.removeItem('cosmicReady_v9')
          localStorage.removeItem('playerName')
          localStorage.setItem('cosmicVersion', String(data.version))
          setStep('instructions')
          setPage('menu')
        }
        setServerVersion(data.version)
        if (local === null) {
          localStorage.setItem('cosmicVersion', String(data.version))
        }
      }
    } catch {}
  }

  useEffect(() => {
    fetchStatus().then(() => {
      setStep(getStep(localStorage.getItem('cosmicVersion')))
    })
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleToggle = async () => {
    setToggling(true)
    try {
      const res = await fetch(`${SERVER}/api/admin/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: ADMIN_SECRET }),
      })
      const data = await res.json()
      setGameOpen(data.open)
    } catch {}
    setToggling(false)
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      const res = await fetch(`${SERVER}/api/admin/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: ADMIN_SECRET }),
      })
      const data = await res.json()
      setGameOpen(data.open)
      setServerVersion(data.version)
    } catch {}
    setResetting(false)
  }

  const markReady = () => {
    localStorage.setItem('cosmicReady_v9', '1')
    setStep('ready')
  }

  return (
    <GameProvider>
      <Stars />
      <Toast />

      {/* 管理員控制台 */}
      {isAdmin && (
        <AdminPanel
          gameOpen={gameOpen}
          onToggle={handleToggle}
          onReset={handleReset}
          toggling={toggling}
          resetting={resetting}
          playerCount={playerCount}
          dailyTip={dailyTip}
          remainingTips={remainingTips}
          totalTips={totalTips}
          onDailyTipChange={(data) => {
            setDailyTip(data.dailyTip)
            setRemainingTips(data.remainingTips)
          }}
        />
      )}

      {/* 廣播公告橫幅 */}
      {broadcastBanner && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, maxWidth: 480, width: 'calc(100% - 32px)',
          background: 'rgba(10,20,50,.92)', border: '1px solid rgba(91,141,238,.5)',
          borderRadius: 12, padding: '12px 16px',
          boxShadow: '0 4px 24px rgba(0,0,0,.6)',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>📢</span>
          <span style={{ flex: 1, fontSize: 14, color: '#c8dbff', lineHeight: 1.6, fontFamily: 'Noto Sans TC,sans-serif' }}>
            {broadcastBanner}
          </span>
          <button onClick={() => setBroadcastBanner('')} style={{
            background: 'none', border: 'none', color: 'rgba(140,180,255,.5)',
            cursor: 'pointer', fontSize: 16, padding: '0 2px', flexShrink: 0,
          }}>✕</button>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, margin: '0 auto' }}>

        {/* 新手流程進度條 */}
        {(step === 'instructions' || step === 'profile') && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '18px 0 4px' }}>
            {[
              { label: '使用說明', idx: 0, active: step === 'instructions' },
              { label: '設定', idx: 1, active: step === 'profile' },
              { label: '主選單', idx: 2, active: false },
            ].map((s, i, arr) => (
              <div key={s.idx} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: s.active ? 'rgba(91,141,238,.4)' : 'rgba(255,255,255,.07)',
                    border: `2px solid ${s.active ? 'rgba(91,141,238,.9)' : 'rgba(255,255,255,.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700,
                    color: s.active ? '#c8dbff' : 'rgba(140,180,255,.35)',
                    boxShadow: s.active ? '0 0 12px rgba(91,141,238,.4)' : 'none',
                    transition: 'all .3s',
                  }}>{s.idx + 1}</div>
                  <div style={{ fontSize: 11, color: s.active ? 'rgba(140,180,255,.8)' : 'rgba(140,180,255,.3)', fontFamily: 'Noto Sans TC,sans-serif', fontWeight: s.active ? 700 : 400 }}>{s.label}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: 40, height: 2, background: 'rgba(91,141,238,.2)', margin: '0 4px 16px' }} />
                )}
              </div>
            ))}
          </div>
        )}

        {step === 'instructions' && (
          <Instructions onDone={() => setStep('profile')} />
        )}

        {step === 'profile' && (
          <ProfileSetup onDone={markReady} />
        )}

        {step === 'ready' && (
          <>
            {page === 'menu'         && <MainMenu navigate={navigate} />}
            {page === 'instructions' && <Instructions onDone={() => navigate('menu')} isRevisit />}
            {page === 'modeSelect'   && <ModeSelect navigate={navigate} onModeSelect={setCurrentMode} />}
            {page === 'quiz'         && <Quiz mode={currentMode} navigate={navigate} onResult={setQuizResult} />}
            {page === 'result'       && <Result result={quizResult} navigate={navigate} />}
            {page === 'codex'        && <Codex navigate={navigate} />}
            {page === 'shop'         && <Shop navigate={navigate} />}
            {page === 'multiSetup'   && (
              <MultiSetup navigate={navigate} onStart={(players) => { setMultiPlayers(players); navigate('multiQuiz') }} />
            )}
            {page === 'multiQuiz'    && (
              <MultiQuiz players={multiPlayers} navigate={navigate} onDone={(results) => { setMultiResults(results); navigate('multiResult') }} />
            )}
            {page === 'multiResult'  && (
              <MultiResult results={multiResults} navigate={navigate} onPlayAgain={() => navigate('multiSetup')} />
            )}
            {page === 'onlineLobby'  && (
              <OnlineLobby navigate={navigate} onRoomReady={(room) => setOnlineRoom(room)} />
            )}
            {page === 'onlineBattle' && onlineRoom && (
              <OnlineBattle room={onlineRoom} navigate={navigate} />
            )}
          </>
        )}

      </div>
    </GameProvider>
  )
}
