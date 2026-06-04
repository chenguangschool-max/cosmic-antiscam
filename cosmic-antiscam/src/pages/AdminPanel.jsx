export default function AdminPanel({ gameOpen, onToggle, onReset, toggling, resetting }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 999,
      background: '#0c1829', border: '1px solid rgba(91,141,238,.4)',
      borderRadius: 16, padding: 18, minWidth: 200,
      boxShadow: '0 8px 32px rgba(0,0,0,.6)',
    }}>
      <div style={{ fontSize: 13, color: 'rgba(140,180,255,.6)', fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>
        ⚙️ 管理員控制台
      </div>

      {/* 狀態燈 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
        padding: '8px 12px', borderRadius: 8,
        background: gameOpen ? 'rgba(50,200,120,.1)' : 'rgba(255,80,80,.1)',
        border: `1px solid ${gameOpen ? 'rgba(50,200,120,.3)' : 'rgba(255,80,80,.3)'}`,
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: gameOpen ? '#34d399' : '#ff6b6b',
          boxShadow: `0 0 8px ${gameOpen ? '#34d399' : '#ff6b6b'}`,
        }} />
        <span style={{ fontSize: 14, color: gameOpen ? '#7ee8c5' : '#ffaaaa', fontWeight: 600 }}>
          {gameOpen ? '遊戲進行中' : '遊戲已關閉'}
        </span>
      </div>

      {/* 開關按鈕 */}
      <button onClick={onToggle} disabled={toggling} style={{
        width: '100%', padding: '11px 0', borderRadius: 10, marginBottom: 8,
        background: gameOpen ? 'rgba(255,80,80,.2)' : 'rgba(50,200,120,.2)',
        border: `1px solid ${gameOpen ? 'rgba(255,80,80,.5)' : 'rgba(50,200,120,.5)'}`,
        color: gameOpen ? '#ffaaaa' : '#7ee8c5',
        fontSize: 14, fontWeight: 700, cursor: toggling ? 'wait' : 'pointer',
        fontFamily: 'Noto Sans TC,sans-serif',
      }}>
        {toggling ? '…' : gameOpen ? '🔒 關閉遊戲' : '🔓 開啟遊戲'}
      </button>

      {/* 重置按鈕 */}
      <button onClick={() => {
        if (window.confirm('確定重置？所有人將重新看使用說明、設定暱稱、金幣歸零。')) onReset()
      }} disabled={resetting} style={{
        width: '100%', padding: '11px 0', borderRadius: 10,
        background: 'rgba(255,180,50,.1)', border: '1px solid rgba(255,180,50,.3)',
        color: '#ffd27a', fontSize: 14, fontWeight: 700,
        cursor: resetting ? 'wait' : 'pointer', fontFamily: 'Noto Sans TC,sans-serif',
      }}>
        {resetting ? '重置中…' : '🔄 重置所有人'}
      </button>
    </div>
  )
}
