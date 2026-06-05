import { useState } from 'react'

export default function ProfileSetup({ onDone }) {
  const [nickname, setNickname] = useState('')
  const [realName, setRealName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [err, setErr] = useState('')

  const handleSubmit = () => {
    if (!nickname.trim()) return setErr('請輸入暱稱')
    if (!realName.trim()) return setErr('請輸入姓名')
    if (!age || isNaN(age) || Number(age) < 1 || Number(age) > 120) return setErr('請輸入有效年齡')
    if (!gender) return setErr('請選擇性別')

    localStorage.setItem('playerName', nickname.trim())
    localStorage.setItem('playerProfile', JSON.stringify({
      nickname: nickname.trim(),
      realName: realName.trim(),
      age: Number(age),
      gender,
    }))
    onDone(nickname.trim())
  }

  const field = (label, content) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 14, color: 'rgba(140,180,255,.7)', marginBottom: 8, fontWeight: 600 }}>{label}</div>
      {content}
    </div>
  )

  const inputStyle = (hasErr) => ({
    width: '100%', padding: '13px 16px', borderRadius: 10,
    background: 'rgba(255,255,255,.07)',
    border: `1px solid ${hasErr ? 'rgba(255,80,80,.5)' : 'rgba(91,141,238,.3)'}`,
    color: '#e0eaff', fontSize: 17, fontFamily: 'Noto Sans TC,sans-serif',
    outline: 'none', boxSizing: 'border-box',
  })

  return (
    <div style={{ padding: '28px 20px', position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🧑‍🚀</div>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 19, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>
          設定
        </div>
        <div style={{ fontSize: 14, color: 'rgba(180,200,255,.5)', marginTop: 6 }}>
          填寫個人資料以開始任務
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{
          padding: '20px', borderRadius: 16,
          background: 'rgba(91,141,238,.06)',
          border: '1px solid rgba(91,141,238,.2)',
          marginBottom: 20,
        }}>

          {field('👤 暱稱（最多 10 字）',
            <input
              value={nickname}
              onChange={e => { setNickname(e.target.value); setErr('') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder='輸入遊戲暱稱'
              maxLength={10}
              autoFocus
              style={inputStyle(err === '請輸入暱稱')}
            />
          )}

          {field('📝 真實姓名',
            <input
              value={realName}
              onChange={e => { setRealName(e.target.value); setErr('') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder='輸入真實姓名'
              maxLength={20}
              style={inputStyle(err === '請輸入姓名')}
            />
          )}

          {field('🎂 年齡',
            <input
              value={age}
              onChange={e => { setAge(e.target.value.replace(/\D/g, '')); setErr('') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder='輸入年齡'
              inputMode='numeric'
              maxLength={3}
              style={inputStyle(err === '請輸入有效年齡')}
            />
          )}

          {field('⚧ 性別',
            <div style={{ display: 'flex', gap: 10 }}>
              {['男', '女', '其他'].map(g => (
                <button
                  key={g}
                  onClick={() => { setGender(g); setErr('') }}
                  style={{
                    flex: 1, padding: '12px 0', borderRadius: 10,
                    background: gender === g ? 'rgba(91,141,238,.3)' : 'rgba(255,255,255,.05)',
                    border: `1px solid ${gender === g ? 'rgba(91,141,238,.7)' : 'rgba(91,141,238,.2)'}`,
                    color: gender === g ? '#c8dbff' : 'rgba(140,180,255,.5)',
                    fontSize: 16, fontWeight: gender === g ? 700 : 400,
                    cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif',
                    transition: 'all .2s',
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          {err && (
            <div style={{ fontSize: 13, color: '#ff9999', marginTop: 4 }}>⚠ {err}</div>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        style={{
          width: '100%', padding: 16, borderRadius: 14,
          background: 'linear-gradient(135deg,rgba(91,141,238,.35),rgba(167,139,250,.3))',
          border: '1px solid rgba(91,141,238,.6)',
          color: '#e0eaff', fontSize: 17, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif', letterSpacing: 1,
          marginBottom: 8,
        }}
      >
        進入宇宙 🚀
      </button>
    </div>
  )
}
