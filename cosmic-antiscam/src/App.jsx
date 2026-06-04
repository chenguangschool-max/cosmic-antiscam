import { useState, useEffect, useRef } from 'react'
import { GameProvider } from './GameContext'
import Stars from './components/Stars'
import Toast from './components/Toast'
import Instructions from './pages/Instructions'
import ProfileSetup from './pages/ProfileSetup'
import WaitingRoom from './pages/WaitingRoom'
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

function getStep(serverVersion) {
  const localVersion = localStorage.getItem('cosmicVersion')
  if (String(serverVersion) !== String(localVersion)) return 'instructions'
  if (!localStorage.getItem('cosmicReady_v8')) return 'instructions'
  return 'ready'
}

export default function App() {
  const [step, setStep] = useState('instructions')
  const [gameOpen, setGameOpen] = useState(false)
  const [serverVersion, setServerVersion] = useState(null)
  const [dailyTip, setDailyTip] = useState(null)
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
      setGameOpen(data.open)
      if (data.dailyTip !== undefined) setDailyTip(data.dailyTip)
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
          localStorage.removeItem('cosmicReady_v8')
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

  const markReady = () => {
    localStorage.setItem('cosmicReady_v8', '1')
    setStep('ready')
  }

  return (
    <GameProvider>
      <Stars />
      <Toast />

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

        {step === 'instructions' && (
          <Instructions onDone={() => setStep('profile')} />
        )}

        {step === 'profile' && (
          <ProfileSetup onDone={markReady} />
        )}

        {step === 'ready' && !gameOpen && (
          <WaitingRoom />
        )}

        {step === 'ready' && gameOpen && (
          <>
            {page === 'menu'         && <MainMenu navigate={navigate} dailyTip={dailyTip} />}
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
