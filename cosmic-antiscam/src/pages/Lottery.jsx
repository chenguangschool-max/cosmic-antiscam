import { useState, useRef } from 'react'
import { useGame } from '../GameContext'
import { useToast } from '../components/Toast'
import { ITEMS } from '../data'

const SYMBOLS = ['🪙', '🌟', '💎', '🎁', '👾', '🔍']
const COST = 50

function evalPrize(a, b, c) {
  if (a === b && b === c) {
    if (a === '💎') return { label: '💎💎💎 超級大獎！', coins: 500, xp: 0, item: null, color: '#ffd700' }
    if (a === '🌟') return { label: '🌟🌟🌟 星光三連！', coins: 200, xp: 100, item: null, color: '#c4b5fd' }
    if (a === '🎁') return { label: '🎁🎁🎁 神秘道具！', coins: 0, xp: 0, item: 'random', color: '#7ee8c5' }
    if (a === '👾') return { label: '👾👾👾 怪物大爆！', coins: 0, xp: 300, item: null, color: '#94e8ff' }
    if (a === '🪙') return { label: '🪙🪙🪙 金幣三連！', coins: 150, xp: 0, item: null, color: '#ffd27a' }
    if (a === '🔍') return { label: '🔍🔍🔍 偵探眼！', coins: 100, xp: 50, item: null, color: '#a3e635' }
  }
  for (const [x, y] of [[a, b], [b, c], [a, c]]) {
    if (x === y) {
      if (x === '💎') return { label: '💎💎 幸運對！', coins: 100, xp: 0, item: null, color: '#ffd700' }
      if (x === '🌟') return { label: '🌟🌟 星光對！', coins: 80, xp: 0, item: null, color: '#c4b5fd' }
      if (x === '🪙') return { label: '🪙🪙 小贏！', coins: 40, xp: 0, item: null, color: '#ffd27a' }
      return { label: '✨ 配對小獎！', coins: 25, xp: 0, item: null, color: 'rgba(180,210,255,.9)' }
    }
  }
  return { label: '😅 安慰獎', coins: 10, xp: 0, item: null, color: 'rgba(140,180,255,.5)' }
}

export default function Lottery({ navigate }) {
  const { coins, addCoins, spendCoins, addXp, addItem } = useGame()
  const showToast = useToast()
  const [reels, setReels] = useState(['🎰', '🎰', '🎰'])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const tickRef = useRef(null)

  const spin = () => {
    if (spinning || coins < COST) return
    spendCoins(COST)
    setSpinning(true)
    setResult(null)

    const final = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    ]

    tickRef.current = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ])
    }, 80)

    setTimeout(() => {
      clearInterval(tickRef.current)
      setReels(final)
      setSpinning(false)

      const prize = evalPrize(...final)
      setResult(prize)
      if (prize.coins > 0) addCoins(prize.coins)
      if (prize.xp > 0) addXp(prize.xp)
      if (prize.item === 'random') {
        const item = ITEMS[Math.floor(Math.random() * ITEMS.length)]
        addItem(item.id)
        showToast(`🎁 抽到 ${item.emoji} ${item.name}！`)
      }

      setHistory(h => [{ reels: final, prize, id: Date.now() }, ...h.slice(0, 4)])
    }, 1800)
  }

  return (
    <div style={{ padding: 18, position: 'relative', zIndex: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <button style={iconBtn} onClick={() => navigate('menu')}>← 主選單</button>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 13, fontWeight: 700, color: '#fff', marginLeft: 8 }}>🎰 防詐抽獎機</div>
        <div style={coinBadge}>🪙 {coins}</div>
      </div>

      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <div style={{
          background: 'rgba(10,20,50,.7)', border: '1px solid rgba(91,141,238,.35)',
          borderRadius: 20, padding: '24px 20px', textAlign: 'center', marginBottom: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
            {reels.map((sym, i) => (
              <div key={i} style={{
                width: 76, height: 76, borderRadius: 16,
                background: spinning ? 'rgba(91,141,238,.18)' : 'rgba(91,141,238,.10)',
                border: `2px solid ${spinning ? 'rgba(91,141,238,.6)' : 'rgba(91,141,238,.28)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 38,
                boxShadow: spinning ? '0 0 18px rgba(91,141,238,.35)' : 'none',
                animation: spinning ? 'pulse 0.15s infinite' : 'none',
                transition: 'border-color .3s, box-shadow .3s',
              }}>{sym}</div>
            ))}
          </div>

          {result && !spinning && (
            <div style={{
              padding: '11px 16px', borderRadius: 12, marginBottom: 16,
              background: 'rgba(0,0,0,.25)', border: `1px solid ${result.color}44`,
              color: result.color, fontSize: 15, fontWeight: 700,
              fontFamily: 'Noto Sans TC,sans-serif',
              animation: 'pop .3s ease',
            }}>
              {result.label}
            </div>
          )}

          {!result && !spinning && (
            <div style={{ fontSize: 13, color: 'rgba(140,180,255,.4)', marginBottom: 16, fontFamily: 'Noto Sans TC,sans-serif' }}>
              按下按鈕開始抽獎
            </div>
          )}

          {spinning && (
            <div style={{ fontSize: 13, color: 'rgba(140,180,255,.6)', marginBottom: 16, fontFamily: 'Noto Sans TC,sans-serif', animation: 'pulse 1s infinite' }}>
              轉動中...
            </div>
          )}

          <div style={{ fontSize: 12, color: 'rgba(140,180,255,.4)', marginBottom: 14, fontFamily: 'Noto Sans TC,sans-serif' }}>
            每次消耗 🪙 {COST} 防詐金幣
          </div>

          <button
            onClick={spin}
            disabled={spinning || coins < COST}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12,
              fontFamily: 'Noto Sans TC,sans-serif', fontSize: 16, fontWeight: 700,
              cursor: (spinning || coins < COST) ? 'default' : 'pointer',
              background: (spinning || coins < COST) ? 'rgba(91,141,238,.06)' : 'rgba(91,141,238,.22)',
              border: `1px solid ${(spinning || coins < COST) ? 'rgba(91,141,238,.15)' : 'rgba(91,141,238,.6)'}`,
              color: (spinning || coins < COST) ? 'rgba(140,180,255,.3)' : '#c8dbff',
              transition: 'all .2s',
            }}
          >
            {spinning ? '🎰 抽獎中...' : coins < COST ? `🪙 金幣不足（需要 ${COST}）` : '🎰 開始抽獎！'}
          </button>
        </div>

        <div style={{
          background: 'rgba(255,255,255,.03)', border: '1px solid rgba(91,141,238,.15)',
          borderRadius: 14, padding: '14px 16px', marginBottom: 12,
        }}>
          <div style={{ fontSize: 11, color: 'rgba(140,180,255,.45)', marginBottom: 10, fontWeight: 700, letterSpacing: 1 }}>獎項表</div>
          {[
            ['💎💎💎', '+500 🪙', '#ffd700'],
            ['🌟🌟🌟', '+200 🪙 +100 XP', '#c4b5fd'],
            ['🎁🎁🎁', '隨機道具', '#7ee8c5'],
            ['👾👾👾', '+300 XP', '#94e8ff'],
            ['🪙🪙🪙', '+150 🪙', '#ffd27a'],
            ['🔍🔍🔍', '+100 🪙 +50 XP', '#a3e635'],
            ['💎💎 任意', '+100 🪙', 'rgba(255,215,0,.55)'],
            ['🌟🌟 任意', '+80 🪙', 'rgba(196,181,253,.55)'],
            ['其他對子', '+25~40 🪙', 'rgba(180,200,255,.5)'],
            ['沒中', '+10 🪙 安慰獎', 'rgba(140,160,200,.38)'],
          ].map(([sym, prize, color]) => (
            <div key={sym} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'rgba(180,200,255,.7)', fontFamily: 'Noto Sans TC,sans-serif' }}>{sym}</span>
              <span style={{ fontSize: 11, color, fontWeight: 600, fontFamily: 'Noto Sans TC,sans-serif' }}>{prize}</span>
            </div>
          ))}
        </div>

        {history.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,.02)', border: '1px solid rgba(91,141,238,.1)',
            borderRadius: 14, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 11, color: 'rgba(140,180,255,.4)', marginBottom: 8, fontWeight: 700, letterSpacing: 1 }}>最近紀錄</div>
            {history.map((h, i) => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < history.length - 1 ? 6 : 0 }}>
                <span style={{ fontSize: 16 }}>{h.reels.join(' ')}</span>
                <span style={{ fontSize: 11, color: h.prize.color, fontFamily: 'Noto Sans TC,sans-serif' }}>{h.prize.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const iconBtn = { background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 20, padding: '5px 13px', color: 'rgba(180,200,255,.7)', fontSize: 12, cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif' }
const coinBadge = { display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,210,50,.1)', border: '1px solid rgba(255,210,50,.32)', borderRadius: 20, padding: '4px 12px', color: 'var(--gold)', fontSize: 13, fontWeight: 500, marginLeft: 'auto' }
