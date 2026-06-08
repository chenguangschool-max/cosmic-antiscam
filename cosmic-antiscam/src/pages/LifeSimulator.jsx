import { useState, useEffect } from 'react'
import { useGame } from '../GameContext'
import { LIFE_SCENARIOS } from '../data/lifeSimScenarios'

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'
const TOTAL = 10
const INIT = 1_000_000

const fmt = n => n.toLocaleString('zh-TW')

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getUsed() {
  try { return JSON.parse(localStorage.getItem('lifeSimUsed') || '[]') } catch { return [] }
}
function saveUsed(ids) { localStorage.setItem('lifeSimUsed', JSON.stringify(ids)) }

export default function LifeSimulator({ navigate }) {
  const { addCoins, addXp } = useGame()
  const [assets, setAssets] = useState(INIT)
  const [queue, setQueue] = useState([])
  const [loaded, setLoaded] = useState(0)
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState('loading')
  const [picked, setPicked] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => { loadQueue() }, [])

  async function loadQueue() {
    let used = getUsed()
    let unused = shuffle(LIFE_SCENARIOS.filter(s => !used.includes(s.id)))

    // 靜態題用完就重置（讓靜態題可重複，但API題不重複）
    if (unused.length < 3) {
      used = used.filter(id => !LIFE_SCENARIOS.some(s => s.id === id))
      saveUsed(used)
      unused = shuffle(LIFE_SCENARIOS)
    }

    const result = unused.slice(0, TOTAL)
    setLoaded(result.length)

    const needed = TOTAL - result.length
    const allUsed = [...used, ...result.map(s => s.id)]

    for (let i = 0; i < needed; i++) {
      try {
        const r = await fetch(`${SERVER}/api/life-scenario`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usedIds: [...allUsed, ...result.slice(LIFE_SCENARIOS.length).map(s => s.id)] }),
        })
        const { scenario } = await r.json()
        if (scenario?.id) { result.push(scenario); allUsed.push(scenario.id) }
      } catch {
        const fb = LIFE_SCENARIOS[i % LIFE_SCENARIOS.length]
        result.push({ ...fb, id: fb.id + '_x' + i })
      }
      setLoaded(result.length)
    }

    setQueue(result)
    setPhase('story')
  }

  function choose(ci) {
    if (picked !== null) return
    setPicked(ci)
    const s = queue[idx]
    const c = s.choices[ci]
    const next = Math.max(0, assets + c.assetChange)
    setAssets(next)
    setHistory(prev => [...prev, {
      title: s.title,
      label: c.label,
      change: c.assetChange,
      safe: c.assetChange >= 0,
    }])
    const used = getUsed()
    if (!used.includes(s.id)) saveUsed([...used, s.id])
    setPhase('consequence')
  }

  function goNext() {
    const ni = idx + 1
    if (ni >= TOTAL) {
      const safe = history.filter(h => h.safe).length
      const coins = Math.floor(assets / 1000)
      if (coins > 0) addCoins(coins)
      addXp(safe * 15, () => {})
      setPhase('done')
    } else {
      setIdx(ni)
      setPicked(null)
      setPhase('story')
    }
  }

  const s = queue[idx]

  // ── 載入中 ──
  if (phase === 'loading') return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 16 }}>
      <div style={{ fontSize: 40 }}>🌐</div>
      <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 14, color: '#c8dbff', letterSpacing: 1 }}>情境載入中</div>
      <div style={{ width: 200, height: 4, background: 'rgba(255,255,255,.07)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(loaded / TOTAL) * 100}%`, background: 'linear-gradient(90deg,#5b8dee,#a78bfa)', transition: 'width .3s', borderRadius: 4 }} />
      </div>
      <div style={{ fontSize: 13, color: 'rgba(140,180,255,.5)' }}>{loaded} / {TOTAL}</div>
    </div>
  )

  // ── 結算 ──
  if (phase === 'done') {
    const totalLoss = history.reduce((s, h) => s + Math.min(0, h.change), 0)
    const totalGain = history.reduce((s, h) => s + Math.max(0, h.change), 0)
    const safeCount = history.filter(h => h.safe).length
    const coins = Math.floor(assets / 1000)
    const level = safeCount >= 8 ? '⭐⭐⭐ 防詐達人' : safeCount >= 5 ? '⭐⭐ 謹慎市民' : '⭐ 新手居民'
    return (
      <div style={{ padding: 18, position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>🏁</div>
          <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: 2 }}>模擬人生結束</div>
        </div>

        {/* 財務摘要 */}
        <div style={card}>
          <Row label="初始資產" value={`💰 ${fmt(INIT)} 元`} />
          {totalLoss < 0 && <Row label="總損失" value={`−${fmt(-totalLoss)} 元`} col="#ff9e9e" />}
          {totalGain > 0 && <Row label="獎勵收入" value={`+${fmt(totalGain)} 元`} col="#7ee8c5" />}
          <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#e0eaff' }}>最終資產</span>
            <span style={{ fontSize: 17, fontWeight: 700, color: assets > INIT * 0.5 ? '#7ee8c5' : '#ff9e9e' }}>💰 {fmt(assets)} 元</span>
          </div>
        </div>

        {/* 紀錄 */}
        <div style={{ ...card, padding: '10px 14px', marginBottom: 12 }}>
          {history.map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{h.safe ? '✅' : '💸'}</span>
              <span style={{ flex: 1, fontSize: 12, color: 'rgba(200,215,255,.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</span>
              <span style={{ fontSize: 12, flexShrink: 0, color: h.change < 0 ? '#ff9e9e' : h.change > 0 ? '#7ee8c5' : 'rgba(140,180,255,.45)' }}>
                {h.change < 0 ? `−${fmt(-h.change)}` : h.change > 0 ? `+${fmt(h.change)}` : '±0'}
              </span>
            </div>
          ))}
        </div>

        {/* 金幣換算 */}
        <div style={{ background: 'rgba(255,210,50,.07)', border: '1px solid rgba(255,210,50,.28)', borderRadius: 14, padding: '16px', textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,210,50,.55)', marginBottom: 4 }}>{fmt(assets)} ÷ 1,000</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--gold)', marginBottom: 6 }}>= {coins} 防詐金幣 🪙</div>
          <div style={{ fontSize: 12, color: 'rgba(200,180,80,.65)' }}>{safeCount}/{TOTAL} 安全判斷 · {level}</div>
        </div>

        <button onClick={() => navigate('menu')} style={{
          width: '100%', padding: 13,
          background: 'rgba(255,210,50,.15)', border: '1px solid rgba(255,210,50,.42)',
          borderRadius: 12, color: 'var(--gold)', fontSize: 16, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif',
        }}>
          ✨ 領取 {coins} 防詐金幣，返回主選單
        </button>
      </div>
    )
  }

  if (!s) return null
  const c = s.choices

  return (
    <div style={{ padding: 18, position: 'relative', zIndex: 2 }}>
      {/* 頂部 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <button style={iconBtn} onClick={() => navigate('menu')}>← 返回</button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: 'rgba(140,180,255,.5)' }}>第 {idx + 1} / {TOTAL} 關</div>
        <div style={{ background: 'rgba(50,200,150,.1)', border: '1px solid rgba(50,200,150,.28)', borderRadius: 20, padding: '4px 12px', fontSize: 13, color: '#7ee8c5', fontWeight: 600 }}>
          💰 {fmt(assets)}
        </div>
      </div>

      {/* 進度條 */}
      <div style={{ height: 3, background: 'rgba(255,255,255,.07)', borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ height: '100%', width: `${((idx + 1) / TOTAL) * 100}%`, background: 'linear-gradient(90deg,#5b8dee,#a78bfa)', transition: 'width .4s', borderRadius: 4 }} />
      </div>

      {/* 情境卡 */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 17 }}>🎬</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#e0eaff' }}>{s.title}</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,150,50,.1)', border: '1px solid rgba(255,150,50,.22)', color: 'rgba(255,190,120,.8)', flexShrink: 0 }}>真實情境</span>
        </div>
        <div style={{ fontSize: 15, color: 'rgba(200,218,255,.88)', lineHeight: 1.85 }}>{s.story}</div>
      </div>

      {/* 選項 */}
      {phase === 'story' && (
        <>
          <div style={{ fontSize: 13, color: 'rgba(140,180,255,.5)', margin: '12px 0 8px', letterSpacing: 0.5 }}>你會怎麼做？</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {c.map((ch, i) => (
              <button key={i} onClick={() => choose(i)} style={{
                display: 'flex', alignItems: 'center', gap: 11,
                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(91,141,238,.2)',
                borderRadius: 11, padding: '12px 14px',
                color: '#c8dbff', fontSize: 15, cursor: 'pointer', textAlign: 'left',
                fontFamily: 'Noto Sans TC,sans-serif',
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{ch.icon}</span>
                <span>{ch.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* 後果 */}
      {phase === 'consequence' && picked !== null && (
        <>
          <div style={{ marginTop: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: 'rgba(140,180,255,.5)', marginBottom: 6 }}>你選擇了：</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(91,141,238,.12)', border: '1px solid rgba(91,141,238,.35)', borderRadius: 11, padding: '11px 14px', color: '#c8dbff', fontSize: 15 }}>
              <span style={{ fontSize: 20 }}>{c[picked].icon}</span>
              <span>{c[picked].label}</span>
            </div>
          </div>

          <div style={{
            background: c[picked].assetChange < 0 ? 'rgba(255,80,80,.07)' : 'rgba(50,200,150,.07)',
            border: `1px solid ${c[picked].assetChange < 0 ? 'rgba(255,80,80,.25)' : 'rgba(50,200,150,.25)'}`,
            borderRadius: 12, padding: '14px 16px', marginBottom: 10, animation: 'slideUp .2s ease',
          }}>
            <div style={{ fontSize: 15, color: 'rgba(220,230,255,.88)', lineHeight: 1.85, marginBottom: 12 }}>{c[picked].consequence}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 19, fontWeight: 700, color: c[picked].assetChange < 0 ? '#ff9e9e' : '#7ee8c5' }}>
                {c[picked].assetChange < 0
                  ? `💸 −${fmt(-c[picked].assetChange)} 元`
                  : c[picked].assetChange > 0
                    ? `✨ +${fmt(c[picked].assetChange)} 元`
                    : '✅ 資產安全'}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(140,180,255,.5)' }}>剩 {fmt(assets)} 元</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(91,141,238,.14)', borderRadius: 10, padding: '11px 14px', marginBottom: 14, fontSize: 13, color: 'rgba(180,200,255,.65)', lineHeight: 1.75 }}>
            💡 {s.explanation}
          </div>

          <button onClick={goNext} style={{
            width: '100%', padding: 12,
            background: 'rgba(91,141,238,.18)', border: '1px solid rgba(91,141,238,.48)',
            borderRadius: 11, color: '#c8dbff', fontSize: 16, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif',
          }}>
            {idx + 1 >= TOTAL ? '查看結果 →' : '繼續 →'}
          </button>
        </>
      )}
    </div>
  )
}

function Row({ label, value, col }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: col ? `${col}99` : 'rgba(140,180,255,.6)' }}>{label}</span>
      <span style={{ fontSize: 14, color: col || '#c8dbff' }}>{value}</span>
    </div>
  )
}

const card = { background: 'rgba(255,255,255,.03)', border: '1px solid rgba(91,141,238,.22)', borderRadius: 14, padding: '14px 16px', marginBottom: 12 }
const iconBtn = { background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 20, padding: '5px 13px', color: 'rgba(180,200,255,.7)', fontSize: 12, cursor: 'pointer' }
