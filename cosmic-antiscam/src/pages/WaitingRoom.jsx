export default function WaitingRoom() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, textAlign: 'center', position: 'relative', zIndex: 2,
    }}>
      <div style={{ fontSize: 64, marginBottom: 20, animation: 'float 3s ease-in-out infinite' }}>🛸</div>
      <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: 2, marginBottom: 12 }}>
        宇宙防詐任務
      </div>
      <div style={{
        padding: '16px 28px', borderRadius: 14, marginBottom: 24,
        background: 'rgba(91,141,238,.1)', border: '1px solid rgba(91,141,238,.3)',
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
        <div style={{ fontSize: 18, color: '#c8dbff', fontWeight: 600, marginBottom: 6 }}>遊戲即將開始</div>
        <div style={{ fontSize: 15, color: 'rgba(180,200,255,.55)', lineHeight: 1.7 }}>
          請稍候，等待老師開啟遊戲…
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'rgba(140,180,255,.35)' }}>
        COSMIC ANTI-SCAM MISSION
      </div>
    </div>
  )
}
