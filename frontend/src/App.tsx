import { useEffect, useState } from 'react'
import qrImg from './assets/stopcode-qr.png'
import './App.css'

// TODO: 백엔드 /api/v1/schedule (DB 관리, KST) 연동 시 이 상수를 대체한다
const TRIGGER_AT = new Date('2026-07-04T13:50:00+09:00')

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function NormalScreen({ now }: { now: Date }) {
  return (
    <main className="normal">
      <div className="normal-clock">
        {now.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </div>
      <div className="normal-date">
        {now.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        })}
      </div>
    </main>
  )
}

function BlueScreen() {
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
    </main>
  )
}

function App() {
  const now = useNow()
  return now >= TRIGGER_AT ? <BlueScreen /> : <NormalScreen now={now} />
}

export default App
