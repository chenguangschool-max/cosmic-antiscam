const MEDALS = ['🥇', '🥈', '🥉']
const COLORS = ['rgba(255,210,50,.15)', 'rgba(200,200,220,.08)', 'rgba(200,140,80,.08)', 'rgba(255,255,255,.04)']
const BORDERS = ['rgba(255,210,50,.4)', 'rgba(200,200,220,.2)', 'rgba(200,140,80,.25)', 'rgba(91,141,238,.15)']

function AvatarThumb({ avatar }) {
  if (!avatar) return null
  if (avatar.startsWith('data:')) {
    return <img src={avatar} alt="av" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  }
  return <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(91,141,238,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{avatar}</div>
}

export default function MultiResult({ results, navigate, onPlayAgain }) {
  const sorted = [...results].sort((a, b) => b.score - a.score || b.coins - a.coins)
  const topScore = sorted[0]?.score ?? 0

  return (
    <div style={{ padding: 18, position: 'relative', zIndex: 2 }}>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <div style={{ fontSize: 48, marginBottom: 6 }}>🏆</div>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>最終排名</div>
        <div style={{ fontSize: 12, color: 'rgba(180,200,255,.45)', marginTop: 4 }}>防詐宇宙對戰結果</div>
      </div>

      <div style={{ marginBottom: 22 }}>
        {sorted.map((p, i) => {
          const isFirst = i === 0 && p.score === topScore
          return (
            <div key={p.name} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', borderRadius: 13, marginBottom: 9,
              background: COLORS[i] || COLORS[3],
              border: `1px solid ${BORDERS[i] || BORDERS[3]}`,
              transform: isFirst ? 'scale(1.02)' : 'none',
              transition: 'transform .2s',
            }}>
              <div style={{ fontSize: 24, width: 32, textAlign: 'center', flexShrink: 0 }}>
                {MEDALS[i] || `${i + 1}`}
              </div>
              {p.avatar && <AvatarThumb avatar={p.avatar} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: isFirst ? 'var(--gold)' : '#e0eaff' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(180,200,255,.45)', marginTop: 2 }}>
                  +{p.coins}🪙　+{p.xp}XP
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 22, fontWeight: 700, color: isFirst ? 'var(--gold)' : '#c8dbff' }}>
                  {p.score}
                  <span style={{ fontSize: 11, opacity: .45, fontWeight: 400 }}>/10</span>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(180,200,255,.4)' }}>
                  {'★'.repeat(Math.round(p.score / 2))}{'☆'.repeat(5 - Math.round(p.score / 2))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={onPlayAgain} style={btnMain}>再戰一局 🚀</button>
        <button onClick={() => navigate('menu')} style={btnSub}>回主選單</button>
      </div>
    </div>
  )
}

const btnMain = { padding: 13, borderRadius: 12, fontSize: 13, cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif', background: 'rgba(91,141,238,.18)', border: '1px solid rgba(91,141,238,.48)', color: '#c8dbff' }
const btnSub  = { padding: 13, borderRadius: 12, fontSize: 13, cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(180,200,255,.55)' }
