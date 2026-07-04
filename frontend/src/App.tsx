import { useEffect, useRef, useState } from 'react'
import qrImg from './assets/instagram-qr.png'
import memeImg from './assets/meme.webp'
import gif1Img from './assets/gif1.gif'
import gif2Img from './assets/gif2.gif'
import './App.css'

// 기본 트리거: 제헌절 전날 17:00 KST. 로그인하면 계정에 저장된 값으로 대체됨
const DEFAULT_TRIGGER = '2026-07-16T17:00'
const STORAGE_KEY = 'bulagji.triggerAt'
const SCREEN_KEY = 'bulagji.screen'
const TOKEN_KEY = 'bulagji.token'
const NICK_KEY = 'bulagji.nickname'
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? 'https://bulagji-backend.onrender.com'

type ScreenType = 'bsod' | 'error' | 'meme' | 'gif1' | 'gif2'

// 이미지/GIF로 표시되는 화면의 소스 (없으면 커스텀 렌더)
const SCREEN_IMAGES: Partial<Record<ScreenType, string>> = {
  meme: memeImg,
  gif1: gif1Img,
  gif2: gif2Img,
}

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function Countdown({ now, triggerAt }: { now: Date; triggerAt: Date }) {
  const diff = Math.max(0, triggerAt.getTime() - now.getTime())
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <div className="countdown">
      {days > 0 ? `${days}일 ` : ''}
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </div>
  )
}

// ── 로그인 / 회원가입 드롭다운 ──────────────────────────
function LoginMenu({
  loggedIn,
  nickname,
  onAuth,
  onLogout,
}: {
  loggedIn: boolean
  nickname: string | null
  onAuth: (r: {
    token: string
    nickname: string | null
    triggerAt: string | null
    screen: string
  }) => void
  onLogout: () => void
}) {
  const displayName = nickname ?? '회원'
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const msg = await res.json().catch(() => null)
        throw new Error(msg?.message ?? '요청에 실패했습니다.')
      }
      const data = await res.json()
      onAuth(data)
      setOpen(false)
      setUsername('')
      setPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '요청에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="account" ref={ref}>
      <button
        type="button"
        className={`avatar${loggedIn ? ' avatar-in' : ''}`}
        aria-label="계정"
        onClick={() => setOpen((v) => !v)}
      >
        {loggedIn ? displayName.charAt(0).toUpperCase() : ''}
        {loggedIn && <span className="avatar-dot" />}
      </button>
      {open && (
        <div className="login-dropdown">
          <div className="login-brand">
            부락지
          </div>
          {loggedIn ? (
            <div className="profile-card">
              <div className="profile-avatar">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="profile-name">{displayName} 님</div>
              <div className="profile-badge">● 로그인됨</div>
              <div className="login-sub profile-sub">
                타이머·화면 설정이 이 계정에 저장·동기화됩니다.
              </div>
              <button
                type="button"
                className="logout-btn"
                onClick={() => {
                  onLogout()
                  setOpen(false)
                }}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <>
              <div className="login-tabs">
                <button
                  type="button"
                  className={mode === 'login' ? 'active' : ''}
                  onClick={() => {
                    setMode('login')
                    setError('')
                  }}
                >
                  로그인
                </button>
                <button
                  type="button"
                  className={mode === 'signup' ? 'active' : ''}
                  onClick={() => {
                    setMode('signup')
                    setError('')
                  }}
                >
                  회원가입
                </button>
              </div>
              <div className="login-sub">
                로그인하면 저장한 타이머·화면을 이 계정에서 불러옵니다.
              </div>
              <form onSubmit={submit}>
                <input
                  type="text"
                  placeholder="아이디"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="비밀번호"
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <div className="login-error">{error}</div>}
                <button type="submit" className="login-submit" disabled={loading}>
                  {loading ? '처리 중…' : mode === 'login' ? '로그인' : '회원가입'}
                </button>
              </form>
              <div className="login-divider">
                <span>또는</span>
              </div>
              <a
                className="naver-btn"
                href={`${API_BASE}/oauth2/authorization/naver`}
              >
                <span className="naver-logo">N</span>
                네이버로 로그인
              </a>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── 타이머 설정 모달 ──────────────────────────
function TimerModal({
  value,
  onSave,
  onClose,
}: {
  value: string
  onSave: (v: string) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(value)
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>타이머 설정</h2>
        <p>지정한 화면으로 전환할 일시를 선택하세요.</p>
        <input
          type="datetime-local"
          step={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <div className="modal-buttons">
          <button type="button" className="modal-cancel" onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className="modal-save"
            onClick={() => draft && onSave(draft)}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 화면 선택 모달 ──────────────────────────
const SCREEN_OPTIONS: { key: ScreenType; label: string; desc: string }[] = [
  { key: 'bsod', label: '블루스크린', desc: 'Windows 오류 전체화면' },
  { key: 'error', label: '오류 팝업창', desc: '치명적 오류 대화상자' },
  { key: 'meme', label: '밈 화면', desc: '아유… 하기 싫어…' },
  { key: 'gif1', label: '책상 GIF', desc: '책상 속으로 사라지기' },
  { key: 'gif2', label: '퇴근 GIF', desc: '최고의 보물은 퇴근' },
]

function ScreenModal({
  value,
  onPreview,
  onClose,
}: {
  value: ScreenType
  onPreview: (v: ScreenType) => void
  onClose: () => void
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2>화면 선택</h2>
        <p>썸네일을 클릭하면 타이머와 상관없이 바로 미리보기가 뜹니다. 미리본 화면이 선택으로 저장됩니다.</p>
        <div className="screen-options">
          {SCREEN_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              className={`screen-option${value === o.key ? ' selected' : ''}`}
              onClick={() => onPreview(o.key)}
            >
              <div className={`screen-thumb thumb-${o.key}`}>
                {o.key === 'bsod' && <span className="thumb-face">:(</span>}
                {o.key === 'error' && <span className="thumb-x">✕</span>}
                {SCREEN_IMAGES[o.key] && <img src={SCREEN_IMAGES[o.key]} alt="" />}
              </div>
              <div className="screen-label">{o.label}</div>
              <div className="screen-desc">{o.desc}</div>
              <div className="screen-play">▶ 바로보기</div>
            </button>
          ))}
        </div>
        <div className="modal-buttons">
          <button type="button" className="modal-cancel" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 서비스 설명 모달 ──────────────────────────
function InfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>🔥 퇴근 방화벽</h2>
        <p className="info-sub">정시 퇴근을 지켜주는 방화벽</p>
        <p className="info-lead">
          정해둔 시간이 되면 모니터에 가짜 고장 화면을 띄워요.
          <br />
          "컴퓨터가 죽었으니 오늘은 여기까지" 하고 당당하게 일어나세요.
        </p>
        <ul className="info-list">
          <li>
            <b>타이머</b> 화면이 뜰 시각을 정합니다
          </li>
          <li>
            <b>화면 선택</b> 블루스크린·오류창·밈·GIF 중 골라요. 누르면 바로
            미리보기
          </li>
          <li>
            <b>로그인</b> 설정을 저장해 다음에도 그대로
          </li>
          <li>
            <b>퇴근 버튼</b> 누르면 폭죽과 함께 원래 화면으로
          </li>
        </ul>
        <div className="modal-buttons">
          <button type="button" className="modal-save" onClick={onClose}>
            좋아요, 퇴근할게요
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 정상(위장) 화면 ──────────────────────────
function NormalScreen({
  now,
  triggerAt,
  screen,
  loggedIn,
  nickname,
  onSetTrigger,
  onPreview,
  onAuth,
  onLogout,
}: {
  now: Date
  triggerAt: Date
  screen: ScreenType
  loggedIn: boolean
  nickname: string | null
  onSetTrigger: (v: string) => void
  onPreview: (v: ScreenType) => void
  onAuth: (r: {
    token: string
    nickname: string | null
    triggerAt: string | null
    screen: string
  }) => void
  onLogout: () => void
}) {
  const [timerOpen, setTimerOpen] = useState(false)
  const [screenOpen, setScreenOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  return (
    <main className="google">
      <header className="google-header">
        <a>Gmail</a>
        {/* '이미지' 링크 = 현재 선택된 화면 즉시 노출 (타이머 무관) */}
        <a className="img-trigger" onClick={() => onPreview(screen)}>
          이미지
        </a>
        <svg className="apps-icon" viewBox="0 0 24 24" width="24" height="24">
          <path
            fill="#e8eaed"
            d="M6,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM16,6c0,1.1 0.9,2 2,2s2,-0.9 2,-2 -0.9,-2 -2,-2 -2,0.9 -2,2zM12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z"
          />
        </svg>
        <LoginMenu
          loggedIn={loggedIn}
          nickname={nickname}
          onAuth={onAuth}
          onLogout={onLogout}
        />
      </header>

      <div className="google-center">
        <div className="google-logo">Google</div>
        <form
          className="google-search"
          onSubmit={(e) => {
            e.preventDefault()
            const q = new FormData(e.currentTarget).get('q')?.toString().trim()
            if (q) {
              window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`
            }
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#9aa0a6"
              d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"
            />
          </svg>
          <input
            type="text"
            name="q"
            placeholder="Google에 물어보기"
            aria-label="검색"
            autoComplete="off"
          />
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              fill="#8ab4f8"
              d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
            />
            <path
              fill="#8ab4f8"
              d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
            />
          </svg>
        </form>

        <div className="shortcuts">
          <div className="shortcut" onClick={() => setInfoOpen(true)}>
            <div className="shortcut-circle">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill="#e8eaed"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                />
              </svg>
            </div>
            <div className="shortcut-label">서비스 설명</div>
            <div className="countdown">퇴근 방화벽</div>
          </div>
          <div className="shortcut" onClick={() => setTimerOpen(true)}>
            <div className="shortcut-circle">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="#e8eaed" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </div>
            <div className="shortcut-label">타이머 설정</div>
            <Countdown now={now} triggerAt={triggerAt} />
          </div>
          <div className="shortcut" onClick={() => setScreenOpen(true)}>
            <div className="shortcut-circle">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path
                  fill="#e8eaed"
                  d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"
                />
              </svg>
            </div>
            <div className="shortcut-label">화면 선택</div>
            <div className="countdown">
              {SCREEN_OPTIONS.find((o) => o.key === screen)?.label}
            </div>
          </div>
        </div>
      </div>

      <div className="customize">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path
            fill="#c2e7ff"
            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
          />
        </svg>
        Chrome 맞춤설정
      </div>

      {timerOpen && (
        <TimerModal
          value={toLocalInputValue(triggerAt)}
          onSave={(v) => {
            onSetTrigger(v)
            setTimerOpen(false)
          }}
          onClose={() => setTimerOpen(false)}
        />
      )}
      {screenOpen && (
        <ScreenModal
          value={screen}
          onPreview={(v) => {
            setScreenOpen(false)
            onPreview(v)
          }}
          onClose={() => setScreenOpen(false)}
        />
      )}
      {infoOpen && <InfoModal onClose={() => setInfoOpen(false)} />}
    </main>
  )
}

// ── 폭죽(퇴근 축하) ──────────────────────────
function Fireworks() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    type P = { x: number; y: number; vx: number; vy: number; life: number; hue: number }
    const parts: P[] = []
    const burst = (x: number, y: number) => {
      const n = 44
      const hue = Math.floor(Math.random() * 360)
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n
        const s = 2 + Math.random() * 4.5
        parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, hue })
      }
    }
    let t = 0
    let raf = 0
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (t % 10 === 0 && t < 140) {
        burst(Math.random() * canvas.width, Math.random() * canvas.height * 0.55 + 40)
      }
      for (const p of parts) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        p.life -= 0.014
        if (p.life <= 0) continue
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = `hsl(${p.hue}, 100%, 60%)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
        ctx.fill()
      }
      t++
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} className="fireworks" />
}

// 퇴근 클릭 → 폭죽 후 복귀
function useCelebrate(onDone: () => void): [boolean, () => void] {
  const [on, setOn] = useState(false)
  const go = () => {
    setOn(true)
    setTimeout(onDone, 2000)
  }
  return [on, go]
}

// ── 전환 화면들 ──────────────────────────
function BlueScreen({ onCheckout }: { onCheckout: () => void }) {
  const [percent, setPercent] = useState(0)
  const [celeb, celebrate] = useCelebrate(onCheckout)
  useEffect(() => {
    const id = setInterval(() => {
      setPercent((p) => (p >= 100 ? 100 : p + Math.floor(Math.random() * 9) + 1))
    }, 1800)
    return () => clearInterval(id)
  }, [])
  return (
    <main className="bsod">
      <div className="bsod-content">
        <div className="bsod-face">:(</div>
        <p className="bsod-message">
          Your PC ran into a problem and needs to restart. We're just
          collecting some error info, and then we'll restart for you.
        </p>
        <p className="bsod-percent">{Math.min(percent, 100)}% complete</p>
        <div className="bsod-footer">
          <img className="bsod-qr" src={qrImg} alt="" />
          <div className="bsod-footer-text">
            <p>
              For more information about this issue and possible fixes, visit
              https://www.windows.com/stopcode
            </p>
            <p className="bsod-support">
              If you call a support person, give them this info:
              <br />
              Stop code: CRITICAL_PROCESS_DIED
            </p>
          </div>
        </div>
      </div>
      <button type="button" className="exit-btn" onClick={celebrate}>
        퇴근
      </button>
      {celeb && <Fireworks />}
    </main>
  )
}

// 구글 위장 화면의 정적 배경 (전환 화면 뒤에 깔아 '내 화면 위에 떴다'는 느낌)
function GoogleBackdrop() {
  return (
    <div className="google google-static">
      <header className="google-header">
        <a>Gmail</a>
        <a>이미지</a>
        <svg className="apps-icon" viewBox="0 0 24 24" width="24" height="24">
          <path
            fill="#e8eaed"
            d="M6,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM16,6c0,1.1 0.9,2 2,2s2,-0.9 2,-2 -0.9,-2 -2,-2 -2,0.9 -2,2zM12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z"
          />
        </svg>
        <div className="avatar" />
      </header>
      <div className="google-center">
        <div className="google-logo">Google</div>
        <div className="google-search">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#9aa0a6"
              d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"
            />
          </svg>
          <input type="text" placeholder="Google에 물어보기" disabled />
        </div>
      </div>
    </div>
  )
}

function detectOS(): 'mac' | 'windows' {
  const ua = navigator.userAgent
  if (/Mac|iPhone|iPad|iPod/.test(ua)) return 'mac'
  return 'windows'
}

type DialogProps = { onCheckout: () => void; onCancel: () => void }

// Windows 클래식 "응용 프로그램 오류" 대화상자
function WinErrorDialog({ onCheckout, onCancel }: DialogProps) {
  return (
    <div className="errbox">
      <div className="errbox-title">
        <span>부락지.exe - 응용 프로그램 오류</span>
        <span className="errbox-x" onClick={onCancel}>
          ✕
        </span>
      </div>
      <div className="errbox-body">
        <div className="errbox-icon">✕</div>
        <div>
          <p className="errbox-h">
            0x00DE4D3F의 명령이 0x00000018의 메모리를 참조했습니다.
          </p>
          <p className="errbox-p">
            메모리가 read될 수 없습니다.
            <br />
            프로그램을 마치려면 [퇴근]을 클릭하십시오.
          </p>
        </div>
      </div>
      <div className="errbox-buttons">
        <button type="button" className="errbox-btn" onClick={onCheckout}>
          퇴근
        </button>
        <button type="button" className="errbox-btn" onClick={onCancel}>
          취소
        </button>
      </div>
    </div>
  )
}

// macOS 스타일 문제 리포트 대화상자
function MacErrorDialog({ onCheckout, onCancel }: DialogProps) {
  return (
    <div className="macbox">
      <div className="macbox-title">
        <span className="macbox-warn">⚠️</span>
        부락지에 대한 문제 리포트
      </div>
      <div className="macbox-body">
        <div className="macbox-icon">⚠️</div>
        <div>
          <p className="macbox-h">
            부락지 응용 프로그램이 예기치 않게 종료되었습니다.
          </p>
          <p className="macbox-p">이 리포트는 자동으로 Apple로 보내집니다.</p>
          <p className="macbox-disc">▶ 설명</p>
        </div>
      </div>
      <div className="macbox-buttons">
        <span className="macbox-help">?</span>
        <button type="button" className="macbox-btn-ghost" onClick={onCancel}>
          취소
        </button>
        <button type="button" className="macbox-btn" onClick={onCheckout}>
          퇴근
        </button>
      </div>
    </div>
  )
}

function ErrorScreen({ onCheckout }: { onCheckout: () => void }) {
  const os = detectOS()
  const Dialog = os === 'mac' ? MacErrorDialog : WinErrorDialog
  const [dialogs, setDialogs] = useState<number[]>([0])
  const idRef = useRef(1)
  const [celeb, celebrate] = useCelebrate(onCheckout)

  // 취소/X → 오른쪽 하단에 팝업이 계속 증식 (팝업 지옥)
  const spawn = () => {
    setDialogs((d) => (d.length >= 40 ? d : [...d, idRef.current++]))
  }

  return (
    <main className="errscreen">
      <GoogleBackdrop />
      <div className="err-overlay">
        {dialogs.map((id, i) => {
          if (i === 0) {
            return (
              <div key={id} className="err-slot-center">
                <Dialog onCheckout={celebrate} onCancel={spawn} />
              </div>
            )
          }
          const k = (i - 1) % 15
          return (
            <div
              key={id}
              className="err-slot"
              style={{ right: 24 + k * 26, bottom: 24 + k * 22 }}
            >
              <Dialog onCheckout={celebrate} onCancel={spawn} />
            </div>
          )
        })}
      </div>
      {celeb && <Fireworks />}
    </main>
  )
}

function ImageScreen({
  src,
  onCheckout,
}: {
  src: string
  onCheckout: () => void
}) {
  const [celeb, celebrate] = useCelebrate(onCheckout)
  return (
    <main className="memescreen">
      <img src={src} alt="" />
      <button type="button" className="exit-btn" onClick={celebrate}>
        퇴근
      </button>
      {celeb && <Fireworks />}
    </main>
  )
}

// ── 앱 루트 ──────────────────────────
function App() {
  const now = useNow()
  const [trigger, setTrigger] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? DEFAULT_TRIGGER,
  )
  const [screen, setScreen] = useState<ScreenType>(
    () => (localStorage.getItem(SCREEN_KEY) as ScreenType) ?? 'bsod',
  )
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  )
  const [nickname, setNickname] = useState<string | null>(() =>
    localStorage.getItem(NICK_KEY),
  )
  // 미리보기: 타이머와 무관하게 즉시 표시할 화면 (null이면 미리보기 아님)
  const [preview, setPreview] = useState<ScreenType | null>(null)
  const triggerAt = new Date(trigger)

  const applyAuth = (r: {
    token: string
    nickname: string | null
    triggerAt: string | null
    screen: string
  }) => {
    localStorage.setItem(TOKEN_KEY, r.token)
    setToken(r.token)
    if (r.nickname) {
      localStorage.setItem(NICK_KEY, r.nickname)
      setNickname(r.nickname)
    }
    if (r.triggerAt) {
      localStorage.setItem(STORAGE_KEY, r.triggerAt)
      setTrigger(r.triggerAt)
    }
    if (r.screen) {
      localStorage.setItem(SCREEN_KEY, r.screen)
      setScreen(r.screen as ScreenType)
    }
  }

  // 네이버 로그인 리다이렉트(?token=) 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    if (!t) return
    localStorage.setItem(TOKEN_KEY, t)
    setToken(t)
    window.history.replaceState({}, '', window.location.pathname)
    fetch(`${API_BASE}/api/v1/me`, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return
        applyAuth({
          token: t,
          nickname: data.nickname,
          triggerAt: data.triggerAt,
          screen: data.screen,
        })
      })
      .catch(() => {})
  }, [])

  const saveSettings = (patch: { triggerAt?: string; screen?: ScreenType }) => {
    if (!token) return
    fetch(`${API_BASE}/api/v1/me/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patch),
    }).catch(() => {})
  }

  const handleSetTrigger = (v: string) => {
    localStorage.setItem(STORAGE_KEY, v)
    setTrigger(v)
    saveSettings({ triggerAt: v })
  }

  const handleSetScreen = (v: ScreenType) => {
    localStorage.setItem(SCREEN_KEY, v)
    setScreen(v)
    saveSettings({ screen: v })
  }

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(NICK_KEY)
    setToken(null)
    setNickname(null)
  }

  // [퇴근] — 트리거를 기본값(D-Day)으로 되돌려 정상 화면 복귀
  const handleCheckout = () => {
    const back = DEFAULT_TRIGGER
    localStorage.setItem(STORAGE_KEY, back)
    setTrigger(back)
    saveSettings({ triggerAt: back })
  }

  // 화면 선택 팝업에서 썸네일 클릭 → 선택 저장 + 즉시 미리보기
  const handlePreview = (v: ScreenType) => {
    handleSetScreen(v)
    setPreview(v)
  }

  // 미리보기 중이면 타이머 무관하게 그 화면, 아니면 트리거 판정
  const activeScreen: ScreenType | null =
    preview ?? (now >= triggerAt ? screen : null)
  const exit = preview ? () => setPreview(null) : handleCheckout

  if (activeScreen) {
    const imgSrc = SCREEN_IMAGES[activeScreen]
    if (activeScreen === 'error') return <ErrorScreen onCheckout={exit} />
    if (imgSrc) return <ImageScreen src={imgSrc} onCheckout={exit} />
    return <BlueScreen onCheckout={exit} />
  }

  return (
    <NormalScreen
      now={now}
      triggerAt={triggerAt}
      screen={screen}
      loggedIn={!!token}
      nickname={nickname}
      onSetTrigger={handleSetTrigger}
      onPreview={handlePreview}
      onAuth={applyAuth}
      onLogout={handleLogout}
    />
  )
}

export default App
