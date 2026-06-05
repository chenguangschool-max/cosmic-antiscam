import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import Anthropic from '@anthropic-ai/sdk'
import { config } from 'dotenv'

config()

const app = express()
const http = createServer(app)
const io = new Server(http, { cors: { origin: '*' } })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

app.use(express.json())
app.get('/health', (_, res) => res.json({ ok: true }))

// ── 遊戲開關與版本 ─────────────────────────────────────────────────────────────
const ADMIN_SECRET = 'cosmic888'
let gameOpen = false
let gameVersion = 13
let broadcastMsg = ''
let onlineCount = 0

app.get('/api/status', (_, res) => {
  pickDailyTip()
  res.json({ open: gameOpen, version: gameVersion, playerCount: onlineCount, broadcast: broadcastMsg, dailyTip: currentDailyTip, remainingTips: TIP_TOPICS.length - usedTipTopics.length, totalTips: TIP_TOPICS.length })
})

app.post('/api/admin/toggle', (req, res) => {
  if (req.body?.secret !== ADMIN_SECRET) return res.status(403).json({ error: 'forbidden' })
  gameOpen = !gameOpen
  io.emit('game-status', { open: gameOpen })
  res.json({ open: gameOpen, version: gameVersion })
})

app.post('/api/admin/reset', (req, res) => {
  if (req.body?.secret !== ADMIN_SECRET) return res.status(403).json({ error: 'forbidden' })
  gameVersion++
  gameOpen = false
  broadcastMsg = ''
  io.emit('game-reset', { version: gameVersion })
  res.json({ version: gameVersion, open: gameOpen })
})

app.post('/api/admin/broadcast', (req, res) => {
  if (req.body?.secret !== ADMIN_SECRET) return res.status(403).json({ error: 'forbidden' })
  broadcastMsg = req.body?.message ?? ''
  res.json({ ok: true })
})

// ── 防詐筆記（每日一題，不重複）──────────────────────────────────────────────

const TIP_TOPICS = [
  '假冒銀行客服要求點連結', '假冒政府說涉及洗錢', '假冒快遞補繳郵資',
  '網路交友後借錢', '假冒電商客服誤設分期', '中獎先繳手續費',
  '高薪工作先繳保證金', '假冒親友借錢', '投資詐騙保證報酬', '假冒電信說欠費停話',
  'AI換臉視訊投資詐騙', 'LINE群組假投資', '假網拍訂金消失', '假借貸先繳保證金',
  '假冒檢察官要求轉帳', '求職先繳設備費', '加密貨幣無法出金', '假冒名人推薦投資',
  '二次詐騙聲稱追回損失', '解除分期要求轉帳', '假公益捐款詐騙',
  '假冒LINE客服凍結帳號', '假冒孫子孫女緊急借錢', '假冒醫院說家人急救',
  '假冒台電水電欠費', '假冒保險業務員到期', '健康食品免費試用強制扣款',
  '假冒里長發放補助', '電話中獎要繳稅金', '假冒國稅局退稅要確認帳號',
]

let usedTipTopics = []
let currentDailyTip = null
let currentTipDate = ''

function pickDailyTip() {
  const today = new Date().toISOString().slice(0, 10)
  if (currentTipDate === today && currentDailyTip) return
  let remaining = TIP_TOPICS.filter(t => !usedTipTopics.includes(t))
  if (remaining.length === 0) { usedTipTopics = []; remaining = [...TIP_TOPICS] }
  const pick = remaining[Math.floor(Math.random() * remaining.length)]
  usedTipTopics.push(pick)
  currentDailyTip = pick
  currentTipDate = today
}

pickDailyTip()

app.post('/api/admin/next-tip', (req, res) => {
  if (req.body?.secret !== ADMIN_SECRET) return res.status(403).json({ error: 'forbidden' })
  currentTipDate = ''
  pickDailyTip()
  res.json({ dailyTip: currentDailyTip, remaining: TIP_TOPICS.length - usedTipTopics.length, total: TIP_TOPICS.length })
})

app.post('/api/admin/reset-tips', (req, res) => {
  if (req.body?.secret !== ADMIN_SECRET) return res.status(403).json({ error: 'forbidden' })
  usedTipTopics = []
  currentDailyTip = null
  currentTipDate = ''
  pickDailyTip()
  res.json({ dailyTip: currentDailyTip, remaining: TIP_TOPICS.length - usedTipTopics.length, total: TIP_TOPICS.length })
})

// ── 防詐筆記 AI 生成 ──────────────────────────────────────────────────────────

app.post('/api/generate-note', async (req, res) => {
  const { topic, date } = req.body || {}
  if (!topic) return res.status(400).json({ error: 'missing topic' })

  try {
    const prompt = `你是防詐騙教育專家，請以「今日防詐筆記」的形式，針對「${topic}」這個詐騙手法，用輕鬆易懂的繁體中文寫一篇約 120 字的短文。
內容包含：這個詐騙的常見手法、為什麼人容易上當、以及一句具體的自保建議。
語氣像是每日學習日記，親切不生硬。只輸出文章本文，不要標題。`

    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })
    res.json({ note: msg.content[0].text.trim(), topic, date })
  } catch (e) {
    res.status(500).json({ error: 'generation failed' })
  }
})

// ── 題庫主題 ───────────────────────────────────────────────────────────────────

const SCAM_TOPICS = [
  '假冒銀行客服要求點連結', '假冒政府說涉及洗錢', '假冒快遞補繳郵資',
  '網路交友後借錢', '假冒電商客服誤設分期', '中獎先繳手續費',
  '高薪工作先繳保證金', '假冒親友借錢', '投資詐騙保證報酬', '假冒電信說欠費停話',
  'AI換臉視訊投資詐騙', 'LINE群組假投資', '假網拍訂金消失', '假借貸先繳保證金',
  '假冒檢察官要求轉帳', '求職先繳設備費', '加密貨幣無法出金', '假冒名人推薦投資',
  '二次詐騙聲稱追回損失', '解除分期要求轉帳', '假公益捐款詐騙',
]

const NORMAL_TOPICS = [
  '電商正常出貨通知', '銀行正常對帳單', '醫院健檢預約確認',
  '學校招生報名通知', '宅配改地址通知', '政府正常稅務繳費',
  '銀行信用卡消費通知', '健保卡補發正常通知', '銀行定存到期通知', '政府退稅通知',
]

// ── 備用靜態題庫（API 失敗時使用）────────────────────────────────────────────

const FALLBACK_QUESTIONS = [
  {
    signal: '銀河聯邦安全局',
    text: '【緊急通知】您的星際帳戶編號 GX-2024-77812 疑似遭非法入侵，資產已被強制凍結。為保護您的 8,500 星幣安全並完成解凍手續，請立即點擊安全驗證連結，並轉帳 2,000 星幣作為身份擔保金。2 小時內未處理帳戶將永久停用，請立即行動！',
    answer: 1,
    explanation: '這是詐騙，因為官方機構不會要求轉帳「擔保金」才能解凍帳戶。',
    topic: '假冒政府說涉及洗錢',
  },
  {
    signal: '宇宙快遞星際服務',
    text: '您有一件跨星系包裹（編號 GX-88731）因未繳星際關稅，暫存於木星轉運站。請於 24 小時內點擊連結補繳關稅 350 星幣，逾期包裹將退回原發件方且不退還費用。此為系統自動通知，請勿回覆，立即處理以免損失！',
    answer: 1,
    explanation: '這是詐騙，因為正規快遞不會要求點陌生連結付關稅。',
    topic: '假冒快遞補繳郵資',
  },
  {
    signal: '宇宙中獎通知中心',
    text: '恭喜！您的星際帳號已被系統抽中榮獲本月特等獎「銀河豪華飛船一艘」，市值 500,000 星幣！請於 48 小時內聯繫客服領獎，並預先繳納 3,000 星幣行政手續費以啟動領獎程序。機會難得，立即回覆確認！',
    answer: 1,
    explanation: '這是詐騙，因為中獎不需要先繳手續費，這是典型的詐騙手法。',
    topic: '中獎先繳手續費',
  },
  {
    signal: '宇宙電信星際帳務',
    text: '【停話警告】您的星際通訊門號帳單金額 2,890 星幣逾期未繳，將於今日 18:00 強制停話。為避免影響通訊及信用記錄，請立即轉帳至帳號 9999-2024-1234 完成繳費，繳費後回傳收據，客服將於 30 分鐘內恢復您的通訊服務。',
    answer: 1,
    explanation: '這是詐騙，因為電信公司不會要求直接轉帳至個人帳號繳費。',
    topic: '假冒電信說欠費停話',
  },
  {
    signal: '星際理財顧問王銀河',
    text: '朋友您好！我是持牌星際理財顧問，目前有一個保證月收益 25% 的礦星投資計劃，已有 3,200 位投資者每月穩定獲利。最低門檻僅需 10,000 星幣，早鳥加入還有額外紅利 500 星幣。機會難得，今天就把錢轉給我開始賺錢！',
    answer: 1,
    explanation: '這是詐騙，因為保證高報酬的投資不存在，私人轉帳投資風險極高。',
    topic: '投資詐騙保證報酬',
  },
  {
    signal: '星際獵才HR銀河人才',
    text: '恭喜您通過「星際數據分析師」初試！月薪 180,000 星幣含交通補助。正式上班前需繳交 5,000 星幣設備保證金，保證到職後第一個月薪資退還。請於 3 天內完成繳款以保留職缺，逾期視同放棄，請聯繫 HR 確認繳款方式。',
    answer: 1,
    explanation: '這是詐騙，因為正規企業不會要求求職者先繳設備保證金。',
    topic: '求職先繳設備費',
  },
  {
    signal: '銀河星際銀行客服',
    text: '親愛的客戶，系統偵測您的星際帳戶有異常登入紀錄，為保護資產安全已暫時鎖定網路銀行功能。請立即點擊以下安全連結，輸入帳號密碼及動態密碼完成身份驗證以解除鎖定。請在 1 小時內完成，否則帳戶將暫停使用！',
    answer: 1,
    explanation: '這是詐騙，因為銀行不會透過簡訊連結要求輸入密碼及動態密碼。',
    topic: '假冒銀行客服要求點連結',
  },
  {
    signal: '銀河商業銀行',
    text: '親愛的客戶您好，您的星際信用卡於今日 14:32 在火星購物中心消費 1,280 星幣（交易序號 MC-78821）。如有疑問或非本人消費，請撥打背面客服專線 0800-888-777 或登入官方網站 galaxybank.space 查詢及申報，本訊息由系統自動發送，請勿直接回覆。',
    answer: 0,
    explanation: '這是正常訊息，因為消費通知提供官方查詢管道，不要求立即付款。',
    topic: '銀行信用卡消費通知',
  },
  {
    signal: '宇宙星際醫院健檢中心',
    text: '您好，您預約的星際健康檢查時間為 2026-06-15 上午 09:30，地點：宇宙大道 100 號星際醫院 3 樓健檢中心。請提前 15 分鐘報到，攜帶星際健保卡及身分證。如需更改或取消，請提前 3 個工作天致電 02-2345-6789，謝謝您的配合。',
    answer: 0,
    explanation: '這是正常訊息，因為預約確認提供具體資訊和官方電話，未要求付款。',
    topic: '醫院健檢預約確認',
  },
  {
    signal: '銀河國稅局',
    text: '納稅義務人您好，依據 2025 年度星際所得稅結算，您應退稅金額為 4,231 星幣，將於 2026-07-01 自動匯入您申報時填寫之帳戶。若帳戶有變更，請至官網 tax.galaxy.gov 申請修改，或攜帶身分證至各地稅務服務中心辦理，請勿輕信非官方管道。',
    answer: 0,
    explanation: '這是正常訊息，因為退稅通知提供官方管道變更資料，未要求立即操作。',
    topic: '政府退稅通知',
  },
]

// ── AI 題目生成 ────────────────────────────────────────────────────────────────

function parseJson(raw) {
  const text = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  return JSON.parse(text)
}

async function genQuestion(isScam, topic) {
  const base = '遊戲世界觀：未來宇宙世界，機構使用「星際」「銀河」「宇宙」前綴，貨幣為「星幣」。只輸出 JSON，不含其他文字。'
  const schema = isScam
    ? `{"signal":"發件人（6-12字）","text":"詐騙訊息（80-130字，製造緊迫感、要求點連結或匯款）","answer":1,"explanation":"這是詐騙，因為…（20-35字）","topic":"${topic}"}`
    : `{"signal":"發件人（6-12字）","text":"正常通知（80-130字，提供官方查詢管道、不要求立即付款）","answer":0,"explanation":"這是正常訊息，因為…（20-35字）","topic":"${topic}"}`

  const prompt = isScam
    ? `你是防詐騙教育遊戲設計師。請生成一道「${topic}」的詐騙情境題。${base}\n格式：${schema}`
    : `你是防詐騙教育遊戲設計師。請生成一道「${topic}」的正常通知題。${base}\n格式：${schema}`

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      })
      return parseJson(msg.content[0].text)
    } catch (e) {
      if (attempt === 1) throw e
      await new Promise(r => setTimeout(r, 1500))
    }
  }
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function genRoomQuestions() {
  try {
    const scamTopics = shuffle(SCAM_TOPICS).slice(0, 7)
    const normalTopics = shuffle(NORMAL_TOPICS).slice(0, 3)
    const assignments = shuffle([
      ...scamTopics.map(t => ({ isScam: true, topic: t })),
      ...normalTopics.map(t => ({ isScam: false, topic: t })),
    ])
    const questions = []
    for (const { isScam, topic } of assignments) {
      questions.push(await genQuestion(isScam, topic))
    }
    return questions
  } catch (e) {
    console.error('AI generation failed, using fallback questions:', e.message)
    return shuffle(FALLBACK_QUESTIONS)
  }
}

// ── 房間管理 ───────────────────────────────────────────────────────────────────

const rooms = new Map()

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code
  do { code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('') }
  while (rooms.has(code))
  return code
}

function roomView(room) {
  return {
    code: room.code,
    players: room.players.map(p => ({ name: p.name, score: p.score })),
    state: room.state,
  }
}

// ── Socket 事件 ────────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  onlineCount++

  socket.on('create-room', ({ name }) => {
    const code = makeCode()
    const room = {
      code, host: socket.id,
      players: [{ id: socket.id, name, score: 0 }],
      state: 'lobby', questions: [], currentQ: 0, answers: {}, timer: null,
    }
    rooms.set(code, room)
    socket.join(code)
    socket.emit('room-joined', { code, isHost: true, players: room.players.map(p => ({ name: p.name, score: 0 })) })
  })

  socket.on('join-room', ({ code, name }) => {
    const room = rooms.get(code.toUpperCase().trim())
    if (!room) return socket.emit('join-error', '找不到此房間代碼')
    if (room.state !== 'lobby') return socket.emit('join-error', '遊戲已經開始，無法加入')
    if (room.players.length >= 4) return socket.emit('join-error', '房間已滿（最多 4 人）')

    room.players.push({ id: socket.id, name, score: 0 })
    socket.join(code.toUpperCase().trim())
    socket.emit('room-joined', { code: room.code, isHost: false, players: room.players.map(p => ({ name: p.name, score: 0 })) })
    io.to(room.code).emit('room-update', { players: room.players.map(p => ({ name: p.name, score: 0 })) })
  })

  socket.on('start-game', async ({ code }) => {
    const room = rooms.get(code)
    if (!room || room.host !== socket.id || room.state !== 'lobby') return
    if (room.players.length < 2) return socket.emit('join-error', '至少需要 2 位玩家才能開始')

    room.state = 'generating'
    io.to(code).emit('game-generating')

    try {
      room.questions = await genRoomQuestions()
      room.state = 'playing'
      room.currentQ = 0
      room.players.forEach(p => { p.score = 0 })
      io.to(code).emit('game-start', { total: room.questions.length })
      setTimeout(() => sendQuestion(room), 1200)
    } catch (e) {
      console.error('Question generation failed:', e)
      room.state = 'lobby'
      io.to(code).emit('gen-error', '題目生成失敗，請再試一次')
    }
  })

  socket.on('submit-answer', ({ code, val }) => {
    const room = rooms.get(code)
    if (!room || room.state !== 'playing') return
    if (room.answers[socket.id] !== undefined) return

    room.answers[socket.id] = { val, time: Date.now() }

    const allAnswered = room.players.every(p => room.answers[p.id] !== undefined)
    if (allAnswered) {
      clearTimeout(room.timer)
      revealQuestion(room)
    }
  })

  socket.on('disconnect', () => {
    onlineCount = Math.max(0, onlineCount - 1)
    for (const [, room] of rooms) {
      const idx = room.players.findIndex(p => p.id === socket.id)
      if (idx === -1) continue

      room.players.splice(idx, 1)

      if (room.players.length === 0) {
        clearTimeout(room.timer)
        rooms.delete(room.code)
      } else {
        if (room.host === socket.id) room.host = room.players[0].id
        io.to(room.code).emit('room-update', { players: room.players.map(p => ({ name: p.name, score: p.score })) })

        if (room.state === 'playing') {
          const allAnswered = room.players.every(p => room.answers[p.id] !== undefined)
          if (allAnswered) { clearTimeout(room.timer); revealQuestion(room) }
        }
      }
      break
    }
  })
})

// ── 遊戲流程 ───────────────────────────────────────────────────────────────────

const TIME_LIMIT = 20

function sendQuestion(room) {
  const q = room.questions[room.currentQ]
  room.answers = {}
  room.questionStartTime = Date.now()

  io.to(room.code).emit('new-question', {
    index: room.currentQ,
    total: room.questions.length,
    signal: q.signal,
    text: q.text,
    timeLimit: TIME_LIMIT,
  })

  room.timer = setTimeout(() => revealQuestion(room), TIME_LIMIT * 1000)
}

function revealQuestion(room) {
  clearTimeout(room.timer)
  const q = room.questions[room.currentQ]

  const playerAnswers = room.players.map(p => {
    const a = room.answers[p.id]
    const answered = a !== undefined
    const correct = answered && a.val === q.answer
    if (correct) p.score += 1
    return { name: p.name, correct: answered ? correct : null }
  })

  const scores = [...room.players]
    .sort((a, b) => b.score - a.score)
    .map(p => ({ name: p.name, score: p.score }))

  io.to(room.code).emit('question-result', {
    correctAnswer: q.answer,
    explanation: q.explanation,
    playerAnswers,
    scores,
  })

  room.currentQ++

  if (room.currentQ >= room.questions.length) {
    room.timer = setTimeout(() => {
      room.state = 'done'
      io.to(room.code).emit('game-over', { results: scores })
    }, 4500)
  } else {
    room.timer = setTimeout(() => sendQuestion(room), 4500)
  }
}

// ── 啟動 ───────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001
http.listen(PORT, () => console.log(`🚀 cosmic-antiscam server on :${PORT}`))
