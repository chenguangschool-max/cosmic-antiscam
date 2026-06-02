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

app.get('/health', (_, res) => res.json({ ok: true }))

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

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  return parseJson(msg.content[0].text)
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
  // 7 詐騙 + 3 正常，各取不重複主題
  const scamTopics = shuffle(SCAM_TOPICS).slice(0, 7)
  const normalTopics = shuffle(NORMAL_TOPICS).slice(0, 3)
  const assignments = shuffle([
    ...scamTopics.map(t => ({ isScam: true, topic: t })),
    ...normalTopics.map(t => ({ isScam: false, topic: t })),
  ])
  return Promise.all(assignments.map(({ isScam, topic }) => genQuestion(isScam, topic)))
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
