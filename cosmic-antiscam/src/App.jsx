import { useState } from 'react'
import { GameProvider } from './GameContext'
import Stars from './components/Stars'
import Toast from './components/Toast'
import Instructions from './pages/Instructions'
import ProfileSetup from './pages/ProfileSetup'
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

function getInitStep() {
  if (!localStorage.getItem('cosmicReady_v7')) return 'instructions'
  return 'ready'
}

export default function App() {
  const [step, setStep] = useState(getInitStep)
  const [page, setPage] = useState('menu')
  const [currentMode, setCurrentMode] = useState(null)
  const [quizResult, setQuizResult] = useState(null)
  const [multiPlayers, setMultiPlayers] = useState([])
  const [multiResults, setMultiResults] = useState([])
  const [onlineRoom, setOnlineRoom] = useState(null)

  const navigate = (p) => setPage(p)

  return (
    <GameProvider>
      <Stars />
      <Toast />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, margin: '0 auto' }}>

        {/* 第一步：使用說明 */}
        {step === 'instructions' && (
          <Instructions onDone={() => setStep('profile')} />
        )}

        {/* 第二步：個人資料 */}
        {step === 'profile' && (
          <ProfileSetup onDone={() => {
            localStorage.setItem('cosmicReady_v7', '1')
            setStep('ready')
          }} />
        )}

        {/* 主遊戲 */}
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
