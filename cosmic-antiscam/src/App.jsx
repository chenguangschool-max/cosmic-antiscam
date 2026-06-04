import { useState, useEffect } from 'react'
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
const ADMIN_SECRET = 'cosmic888'

function getInitStep() {
  if (!localStorage.getItem('cosmicReady_v8')) return 'instructions'
  return 'ready'
}

// 管理員模式：網址帶 ?admin=cosmic888 時自動啟用
function checkAdmin() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('admin') === ADMIN_SECRET) {
    localStorage.setItem('isAdmin', '1')
    // 清掉網址參數
    window.history.replaceState({}, '', window.location.pathname)
  }
  return localStorage.getItem('isAdmin') === '1'
}

export default function App() {
  const [step, setStep] = useState(getInitStep)
  const [gameOpen, setGameOpen] = useState(false)
  const [isAdmin] = useState(checkAdmin)
  const [toggling, setToggling] = useState(false)
  const [page, setPage] = useState('menu')
  const [currentMode, setCurrentMode] = useState(null)
  const [quizResult, setQuizResult] = useState(null)
  const [multiPlayers, setMultiPlayers] = useState([])
  const [multiResults, setMultiResults] = useState([])
  const [onlineRoom, setOnlineRoom] = useState(null)

  // 輪詢遊戲狀態
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${SERVER}/api/status`)
        const data = await res.json()
        setGameOpen(data.open)
      } catch {}
    }
    check()
    const interval = setInterval(check, 5000)
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

  const navigate = (p) => setPage(p)

  return (
    <GameProvider>
      <Stars />
      <Toast />

      {/* 管理員懸浮按鈕 */}
      {isAdmin && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
        }}>
          <button onClick={handleToggle} disabled={toggling} style={{
            padding: '14px 22px', borderRadius: 14, fontSize: 16, fontWeight: 700,
            fontFamily: 'Noto Sans TC,sans-serif', cursor: 'pointer',
            border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.5)',
            background: gameOpen ? 'rgba(255,80,80,.9)' : 'rgba(50,200,120,.9)',
            color: '#fff', transition: 'all .2s',
          }}>
            {toggling ? '…' : gameOpen ? '🔒 關閉遊戲' : '🔓 開啟遊戲'}
          </button>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, margin: '0 auto' }}>

        {/* 第一步：使用說明 */}
        {step === 'instructions' && (
          <Instructions onDone={() => setStep('profile')} />
        )}

        {/* 第二步：個人資料 */}
        {step === 'profile' && (
          <ProfileSetup onDone={() => {
            localStorage.setItem('cosmicReady_v8', '1')
            setStep('ready')
          }} />
        )}

        {/* 等待畫面（遊戲未開啟且非管理員） */}
        {step === 'ready' && !gameOpen && !isAdmin && (
          <WaitingRoom />
        )}

        {/* 主遊戲（遊戲已開啟，或管理員可直接進入） */}
        {step === 'ready' && (gameOpen || isAdmin) && (
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
