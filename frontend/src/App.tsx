import { useEffect, useRef, useState } from 'react'
import qrImg from './assets/instagram-qr.png'
import memeImg from './assets/meme.webp'
import './App.css'

// 기본 트리거: 제헌절 전날 17:00 KST. 로그인하면 계정에 저장된 값으로 대체됨
const DEFAULT_TRIGGER = '2026-07-16T17:00'
const STORAGE_KEY = 'bulagji.triggerAt'
const SCREEN_KEY = 'bulagji.screen'
const TOKEN_KEY = 'bulagji.token'
const NICK_KEY = 'bulagji.nickname'
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? 'https://bulagji-backend.onrender.com'

type ScreenType = 'bsod' | 'error' | 'meme'

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
            <span className="login-brand-mark">💙</span> 부락지
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
]

function ScreenModal({
  value,
  onSave,
  onClose,
}: {
  value: ScreenType
  onSave: (v: ScreenType) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<ScreenType>(value)
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2>화면 선택</h2>
        <p>타이머가 끝나면 표시할 화면을 고르세요.</p>
        <div className="screen-options">
          {SCREEN_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              className={`screen-option${draft === o.key ? ' selected' : ''}`}
              onClick={() => setDraft(o.key)}
            >
              <div className={`screen-thumb thumb-${o.key}`}>
                {o.key === 'bsod' && <span className="thumb-face">:(</span>}
                {o.key === 'error' && <span className="thumb-x">✕</span>}
                {o.key === 'meme' && <img src={memeImg} alt="" />}
              </div>
              <div className="screen-label">{o.label}</div>
              <div className="screen-desc">{o.desc}</div>
            </button>
          ))}
        </div>
        <div className="modal-buttons">
          <button type="button" className="modal-cancel" onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className="modal-save"
            onClick={() => onSave(draft)}
          >
            저장
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
  onSetScreen,
  onAuth,
  onLogout,
}: {
  now: Date
  triggerAt: Date
  screen: ScreenType
  loggedIn: boolean
  nickname: string | null
  onSetTrigger: (v: string) => void
  onSetScreen: (v: ScreenType) => void
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
  return (
    <main className="google">
      <header className="google-header">
        <a>Gmail</a>
        <a>이미지</a>
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
          onSave={(v) => {
            onSetScreen(v)
            setScreenOpen(false)
          }}
          onClose={() => setScreenOpen(false)}
        />
      )}
    </main>
  )
}

// ── 전환 화면들 ──────────────────────────
function BlueScreen({ onCheckout }: { onCheckout: () => void }) {
  const [percent, setPercent] = useState(0)
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
      <button type="button" className="exit-btn" onClick={onCheckout}>
        퇴근
      </button>
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

function ErrorScreen({ onCheckout }: { onCheckout: () => void }) {
  return (
    <main className="errscreen">
      <GoogleBackdrop />
      <div className="err-overlay">
        {/* 뒤에 겹쳐 쌓인 느낌을 주는 데코 팝업 2개 */}
        <div className="errbox errbox-ghost errbox-ghost2" />
        <div className="errbox errbox-ghost errbox-ghost1" />
        <div className="errbox">
          <div className="errbox-title">
            <span>⚠ 시스템 오류</span>
            <span className="errbox-x">✕</span>
          </div>
          <div className="errbox-body">
            <div className="errbox-icon">✕</div>
            <div>
              <p className="errbox-h">치명적인 오류가 발생했습니다.</p>
              <p className="errbox-p">
                응용 프로그램을 계속 실행할 수 없습니다.
                <br />
                오류 코드: 0x000DE4D (WORK_OVERLOAD_EXCEPTION)
              </p>
            </div>
          </div>
          <div className="errbox-buttons">
            <button type="button" className="errbox-btn" onClick={onCheckout}>
              퇴근
            </button>
            <button
              type="button"
              className="errbox-btn errbox-btn-ghost"
              disabled
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

function MemeScreen({ onCheckout }: { onCheckout: () => void }) {
  return (
    <main className="memescreen">
      <img src={memeImg} alt="아유 하기 싫어" />
      <button type="button" className="exit-btn" onClick={onCheckout}>
        퇴근
      </button>
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

  if (now >= triggerAt) {
    if (screen === 'error') return <ErrorScreen onCheckout={handleCheckout} />
    if (screen === 'meme') return <MemeScreen onCheckout={handleCheckout} />
    return <BlueScreen onCheckout={handleCheckout} />
  }

  return (
    <NormalScreen
      now={now}
      triggerAt={triggerAt}
      screen={screen}
      loggedIn={!!token}
      nickname={nickname}
      onSetTrigger={handleSetTrigger}
      onSetScreen={handleSetScreen}
      onAuth={applyAuth}
      onLogout={handleLogout}
    />
  )
}

export default App
