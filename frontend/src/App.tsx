import { useEffect, useState } from 'react'
import qrImg from './assets/instagram-qr.png'
import './App.css'

// 기본 트리거: 제헌절 전날 17:00 KST. TODO: 백엔드 /api/v1/schedule (DB 관리) 연동 시 대체
const DEFAULT_TRIGGER = '2026-07-16T17:00'
const STORAGE_KEY = 'bulagji.triggerAt'

function loadTrigger(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_TRIGGER
}

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
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
  // 네이티브 달력 팝업이 모달 밖으로 펼쳐지므로 배경 클릭으로 닫지 않는다 (취소 버튼으로만 닫기)
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>타이머 설정</h2>
        <p>블루스크린으로 전환할 일시를 선택하세요.</p>
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

function NormalScreen({
  now,
  triggerAt,
  onSetTrigger,
}: {
  now: Date
  triggerAt: Date
  onSetTrigger: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
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
        <div className="avatar" />
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

        <div className="shortcut" onClick={() => setOpen(true)}>
          <div className="shortcut-circle">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#e8eaed" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </div>
          <div className="shortcut-label">타이머 설정</div>
          <Countdown now={now} triggerAt={triggerAt} />
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

      {open && (
        <TimerModal
          value={toLocalInputValue(triggerAt)}
          onSave={(v) => {
            onSetTrigger(v)
            setOpen(false)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </main>
  )
}

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
      <button type="button" className="bsod-checkout" onClick={onCheckout}>
        퇴근
      </button>
    </main>
  )
}

function App() {
  const now = useNow()
  const [trigger, setTrigger] = useState(loadTrigger)
  const triggerAt = new Date(trigger)

  const handleSetTrigger = (v: string) => {
    localStorage.setItem(STORAGE_KEY, v)
    setTrigger(v)
  }

  // [퇴근] — 저장된 타이머를 삭제하고 기본값(D-Day)으로 되돌려 정상 화면으로 복귀
  const handleCheckout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setTrigger(DEFAULT_TRIGGER)
  }

  return now >= triggerAt ? (
    <BlueScreen onCheckout={handleCheckout} />
  ) : (
    <NormalScreen now={now} triggerAt={triggerAt} onSetTrigger={handleSetTrigger} />
  )
}

export default App
