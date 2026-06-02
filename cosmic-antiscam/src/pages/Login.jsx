import { useState } from 'react'
import { useGame } from '../GameContext'
import { useToast } from '../components/Toast'

export default function Login({ navigate }) {
  const { currentUser, setCurrentUser, coins } = useGame()
  const showToast = useToast()
  const [tab, setTab] = useState('login')
  const [lEmail, setLEmail] = useState('')
  const [lPw, setLPw] = useState('')
  const [rName, setRName] = useState('')
  const [rEmail, setREmail] = useState('')
  const [rPw, setRPw] = useState('')
  const [err, setErr] = useState('')

  // NOTE: Replace this with real Firebase auth
  const fakeLogin = (name, email, isGuest=false) => {
    setCurrentUser({ name, email, isGuest })
    showToast(`👨‍🚀 歡迎，${name}！`)
  }

  const doLogin = () => {
    if (!lEmail || !lPw) { setErr('請填寫電子郵件與密碼'); return }
    fakeLogin(lEmail.split('@')[0] || '太空旅人', lEmail)
  }

  const doRegister = () => {
    if (!rName) { setErr('請輸入太空人名稱'); return }
    if (rPw.length < 6) { setErr('密碼至少6位'); return }
    fakeLogin(rName, rEmail)
  }

  return (
    <div style={{ padding:18, position:'relative', zIndex:2 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        <button style={iconBtn} onClick={() => navigate('menu')}>← 返回</button>
      </div>

      <div style={{ maxWidth:330, margin:'0 auto' }}>
        <div style={{ background:'#0c1829', border:'1px solid rgba(91,141,238,.26)', borderRadius:18, padding:'26px 22px' }}>
          <div style={{ textAlign:'center', marginBottom:18 }}>
            <div style={{ fontSize:38, marginBottom:7, animation:'float 3s ease-in-out infinite' }}>🪐</div>
            <div style={{ fontFamily:'Orbitron,monospace', fontSize:13, fontWeight:700, color:'#fff', letterSpacing:1 }}>宇宙防詐任務</div>
            <div style={{ fontSize:10, color:'rgba(180,200,255,.42)', marginTop:2 }}>登入以儲存進度</div>
          </div>

          {!currentUser ? (
            <>
              <div style={{ display:'flex', marginBottom:14, background:'rgba(255,255,255,.04)', borderRadius:8, padding:3 }}>
                {['login','reg'].map(t => (
                  <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
                    flex:1, padding:6, fontSize:11, fontWeight:500, border:'none',
                    background: tab===t ? 'rgba(91,141,238,.22)':'transparent',
                    color: tab===t ? '#c8dbff':'rgba(180,200,255,.48)',
                    borderRadius:6, cursor:'pointer', fontFamily:'Noto Sans TC,sans-serif',
                  }}>
                    {t==='login'?'登入':'註冊'}
                  </button>
                ))}
              </div>

              {tab==='login' ? (
                <>
                  <Field label="電子郵件" type="email" val={lEmail} set={setLEmail} />
                  <Field label="密碼" type="password" val={lPw} set={setLPw} />
                  {err && <div style={{ fontSize:10, color:'#ff9e9e', marginTop:4 }}>{err}</div>}
                  <button onClick={doLogin} style={mainBtn}>登入</button>
                </>
              ) : (
                <>
                  <Field label="太空人名稱" type="text" val={rName} set={setRName} />
                  <Field label="電子郵件" type="email" val={rEmail} set={setREmail} />
                  <Field label="密碼（至少6位）" type="password" val={rPw} set={setRPw} />
                  {err && <div style={{ fontSize:10, color:'#ff9e9e', marginTop:4 }}>{err}</div>}
                  <button onClick={doRegister} style={mainBtn}>建立帳號</button>
                </>
              )}

              <div style={{ display:'flex', alignItems:'center', gap:7, margin:'11px 0' }}>
                <div style={{ flex:1, height:1, background:'rgba(91,141,238,.12)' }} />
                <span style={{ fontSize:10, color:'rgba(140,160,200,.32)' }}>或</span>
                <div style={{ flex:1, height:1, background:'rgba(91,141,238,.12)' }} />
              </div>

              <button onClick={() => fakeLogin('星際探索者','google@user.com')} style={{ ...mainBtn, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.12)', color:'#ccd6f6', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <svg width="14" height="14" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Google 登入
              </button>

              <div style={{ textAlign:'center', marginTop:10 }}>
                <button onClick={() => fakeLogin('訪客太空人','guest',true)} style={{ background:'none', border:'none', color:'rgba(140,180,255,.42)', fontSize:10, cursor:'pointer', textDecoration:'underline', fontFamily:'Noto Sans TC,sans-serif' }}>
                  以訪客身份繼續
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(91,141,238,.16)', border:'2px solid rgba(91,141,238,.35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, margin:'0 auto 9px' }}>
                👨‍🚀
              </div>
              <div style={{ fontSize:15, fontWeight:500, color:'#e0eaff', marginBottom:2 }}>{currentUser.name}</div>
              <div style={{ fontSize:10, color:'rgba(140,180,255,.48)', marginBottom:12 }}>{currentUser.isGuest ? '訪客模式' : currentUser.email}</div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:'rgba(255,210,50,.07)', border:'1px solid rgba(255,210,50,.22)', borderRadius:20, padding:'4px 12px', color:'var(--gold)', fontSize:11, marginBottom:14 }}>
                🪙 {coins}
              </div>
              <br />
              <button onClick={() => setCurrentUser(null)} style={{ background:'rgba(255,80,80,.07)', border:'1px solid rgba(255,80,80,.2)', borderRadius:8, color:'#ff9e9e', fontSize:11, padding:'6px 16px', cursor:'pointer', fontFamily:'Noto Sans TC,sans-serif' }}>
                登出
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, val, set }) {
  return (
    <div style={{ marginBottom:11 }}>
      <label style={{ display:'block', fontSize:10, color:'rgba(140,180,255,.6)', marginBottom:3 }}>{label}</label>
      <input type={type} value={val} onChange={e=>set(e.target.value)} style={{ width:'100%', padding:'8px 12px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(91,141,238,.2)', borderRadius:8, color:'#e0eaff', fontSize:12, fontFamily:'Noto Sans TC,sans-serif', outline:'none' }} />
    </div>
  )
}

const iconBtn = { background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.14)', borderRadius:20, padding:'5px 13px', color:'rgba(180,200,255,.7)', fontSize:12, cursor:'pointer' }
const mainBtn = { width:'100%', padding:10, background:'rgba(91,141,238,.2)', border:'1px solid rgba(91,141,238,.45)', borderRadius:10, color:'#c8dbff', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'Noto Sans TC,sans-serif', marginTop:2 }
