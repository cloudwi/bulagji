# 부락지

연휴 전날 오후 5시, 당신의 모니터가 "고장" 납니다.

트리거 시각이 되면 화면에 가짜 오류 창 / 블루스크린(BSOD)을 띄워 빠른 퇴근을 유도하는 유머 웹 서비스입니다. 오류 창은 닫기(X)로 닫을 수 없고, 오직 **[퇴근] 버튼**으로만 닫을 수 있습니다. 🏃💨

- 로그인 없음 — URL 접속만으로 사용
- 트리거 일시는 DB에서 관리 (한국시간 KST 기준, 첫 해 기본값: 2026-07-16 17:00)
- 매년 반복 동작하는 웹 서비스

## 구조

```
bulagji/
├── backend/    # Kotlin + Spring Boot 4.1 (JDK 21, Gradle Kotlin DSL)
└── frontend/   # React + Vite + TypeScript
```

## 실행

**Backend**

```bash
cd backend
./gradlew bootRun
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

## 인프라

| 영역 | 서비스 |
| --- | --- |
| 백엔드 서버 | Render |
| DB · 파일 저장 | Supabase (PostgreSQL + Storage) |
| 헬스체크 · 모니터링 | UptimeRobot |
| 프론트 호스팅 | Vercel |
