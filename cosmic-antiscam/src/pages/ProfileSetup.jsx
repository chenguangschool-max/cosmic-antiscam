import { useState, useRef, useEffect } from 'react'

const PRESET_AVATARS = ['🧑‍🚀', '👴', '🧓', '🕵️', '🤖', '👨‍💻']

export default function ProfileSetup({ onDone }) {
  const saved = JSON.parse(localStorage.getItem('playerProfile') || '{}')
  const [nickname, setNickname] = useState(saved.nickname || '')
  const [realName, setRealName] = useState(saved.realName || '')
  const [age, setAge] = useState(saved.age ? String(saved.age) : '')
  const [gender, setGender] = useState(saved.gender || '')
  const [avatar, setAvatar] = useState(saved.avatar || '🧑‍🚀')
  const [err, setErr] = useState('')
  const [showPhotoMenu, setShowPhotoMenu] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [camErr, setCamErr] = useState('')
  const videoRef = useRef()
  const streamRef = useRef()
  const galleryRef = useRef()

  useEffect(() => () => stopStream(), [])

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  const openCamera = async () => {
    setShowPhotoMenu(false)
    setCamErr('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      setShowCamera(true)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      }, 80)
    } catch {
      setCamErr('無法開啟相機，請允許相機權限，或使用「從圖庫選擇」')
      setShowPhotoMenu(true)
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video) return
    const size = Math.min(video.videoWidth, video.videoHeight)
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.drawImage(
      video,
      (video.videoWidth - size) / 2,
      (video.videoHeight - size) / 2,
      size, size, 0, 0, size, size,
    )
    setAvatar(canvas.toDataURL('image/jpeg', 0.85))
    stopStream()
    setShowCamera(false)
  }

  const closeCamera = () => {
    stopStream()
    setShowCamera(false)
  }

  const handleGallery = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setAvatar(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

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
      avatar,
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

  const isPhoto = avatar.startsWith('data:')

  return (
    <>
      {/* 相機畫面 */}
      {showCamera && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 300, display: 'flex', flexDirection: 'column' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ flex: 1, objectFit: 'cover', width: '100%' }}
          />
          <div style={{ padding: '16px 20px 40px', display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,.6)' }}>
            <button
              onClick={closeCamera}
              style={{ padding: '10px 24px', borderRadius: 24, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.25)', color: '#fff', fontSize: 15, cursor: 'pointer' }}
            >
              取消
            </button>
            <button
              onClick={capturePhoto}
              style={{ width: 68, height: 68, borderRadius: '50%', background: '#fff', border: '4px solid rgba(91,141,238,.8)', fontSize: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              📷
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: '28px 20px', position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          {isPhoto
            ? <img src={avatar} alt="avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginBottom: 10, border: '2px solid rgba(91,141,238,.6)' }} />
            : <div style={{ fontSize: 56, marginBottom: 10, lineHeight: 1 }}>{avatar}</div>
          }
          <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 19, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>設定</div>
          <div style={{ fontSize: 14, color: 'rgba(180,200,255,.5)', marginTop: 6 }}>填寫個人資料以開始任務</div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ padding: '20px', borderRadius: 16, background: 'rgba(91,141,238,.06)', border: '1px solid rgba(91,141,238,.2)', marginBottom: 20 }}>

            {field('🖼 頭像',
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 10 }}>
                  {PRESET_AVATARS.map(em => (
                    <button
                      key={em}
                      onClick={() => setAvatar(em)}
                      style={{
                        fontSize: 28, padding: '8px 0', borderRadius: 10, lineHeight: 1,
                        background: avatar === em ? 'rgba(91,141,238,.3)' : 'rgba(255,255,255,.05)',
                        border: `2px solid ${avatar === em ? 'rgba(91,141,238,.8)' : 'rgba(91,141,238,.15)'}`,
                        cursor: 'pointer', transition: 'all .15s',
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>

                {/* 隱藏的圖庫 input */}
                <input ref={galleryRef} id="ps-gallery" type="file" accept="image/*" onChange={handleGallery} style={{ display: 'none' }} />

                <button
                  onClick={() => setShowPhotoMenu(true)}
                  style={{
                    width: '100%', padding: '10px 0', borderRadius: 10,
                    background: isPhoto ? 'rgba(91,141,238,.25)' : 'rgba(255,255,255,.05)',
                    border: `1px dashed ${isPhoto ? 'rgba(91,141,238,.8)' : 'rgba(91,141,238,.3)'}`,
                    color: isPhoto ? '#c8dbff' : 'rgba(140,180,255,.6)',
                    fontSize: 14, cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif', transition: 'all .15s',
                  }}
                >
                  {isPhoto ? '✅ 已使用自訂照片　點此更換' : '📷 上傳照片'}
                </button>

                {camErr && <div style={{ fontSize: 12, color: '#ff9e9e', marginTop: 8, textAlign: 'center' }}>{camErr}</div>}

                {showPhotoMenu && (
                  <div
                    onClick={() => setShowPhotoMenu(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
                  >
                    <div
                      onClick={e => e.stopPropagation()}
                      style={{ width: '100%', background: '#131c38', borderRadius: '18px 18px 0 0', padding: '20px 16px 36px' }}
                    >
                      <div style={{ fontSize: 13, color: 'rgba(140,180,255,.55)', textAlign: 'center', marginBottom: 16, fontFamily: 'Noto Sans TC,sans-serif' }}>選擇圖片來源</div>

                      {/* 拍照：用 getUserMedia */}
                      <button
                        onClick={openCamera}
                        style={{ width: '100%', padding: '14px 0', borderRadius: 12, marginBottom: 10, background: 'rgba(91,141,238,.18)', border: '1px solid rgba(91,141,238,.4)', color: '#c8dbff', fontSize: 15, cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif' }}
                      >
                        📷 拍照
                      </button>

                      {/* 圖庫：用 label 觸發 file input */}
                      <label
                        htmlFor="ps-gallery"
                        onClick={() => setShowPhotoMenu(false)}
                        style={{ display: 'block', width: '100%', padding: '14px 0', borderRadius: 12, marginBottom: 10, background: 'rgba(91,141,238,.18)', border: '1px solid rgba(91,141,238,.4)', color: '#c8dbff', fontSize: 15, cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif', textAlign: 'center', boxSizing: 'border-box' }}
                      >
                        🖼 從圖庫選擇
                      </label>

                      <button
                        onClick={() => setShowPhotoMenu(false)}
                        style={{ width: '100%', padding: '12px 0', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(180,200,255,.5)', fontSize: 14, cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif' }}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

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
                {['男', '女'].map(g => (
                  <button
                    key={g}
                    onClick={() => { setGender(g); setErr('') }}
                    style={{
                      flex: 1, padding: '12px 0', borderRadius: 10,
                      background: gender === g ? 'rgba(91,141,238,.3)' : 'rgba(255,255,255,.05)',
                      border: `1px solid ${gender === g ? 'rgba(91,141,238,.7)' : 'rgba(91,141,238,.2)'}`,
                      color: gender === g ? '#c8dbff' : 'rgba(140,180,255,.5)',
                      fontSize: 16, fontWeight: gender === g ? 700 : 400,
                      cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif', transition: 'all .2s',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}

            {err && <div style={{ fontSize: 13, color: '#ff9999', marginTop: 4 }}>⚠ {err}</div>}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          style={{
            width: '100%', padding: 16, borderRadius: 14,
            background: 'linear-gradient(135deg,rgba(91,141,238,.35),rgba(167,139,250,.3))',
            border: '1px solid rgba(91,141,238,.6)',
            color: '#e0eaff', fontSize: 17, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Noto Sans TC,sans-serif', letterSpacing: 1, marginBottom: 8,
          }}
        >
          進入宇宙 🚀
        </button>
      </div>
    </>
  )
}
