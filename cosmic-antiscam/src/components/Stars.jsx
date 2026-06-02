import { useMemo } from 'react'

export default function Stars() {
  const stars = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 0.5,
    left: Math.random() * 100,
    top: Math.random() * 100,
    dur: (Math.random() * 3 + 1.5).toFixed(1),
    delay: (Math.random() * 3).toFixed(1),
  })), [])

  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position:'absolute',
          width: s.size, height: s.size,
          left: `${s.left}%`, top: `${s.top}%`,
          background: '#fff', borderRadius: '50%',
          animation: `twinkle ${s.dur}s ${s.delay}s infinite ease-in-out`,
        }} />
      ))}
    </div>
  )
}
