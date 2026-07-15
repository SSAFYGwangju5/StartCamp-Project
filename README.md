# Busan LocalHub

부산 관광객을 위한 지역정보 커뮤니티 MVP입니다.

## 기술 스택

- Frontend: Vue.js 3 + Vite
- Backend: FastAPI
- Database: SQLite
- Data: 한국관광공사 TourAPI 4.0 부산 데이터

## 주요 기능

- 부산 관광지/문화시설/숙박/쇼핑/레포츠 카테고리 탐색
- 축제/행사, 여행코스 목록 및 상세
- 장소명/주소 검색
- 커뮤니티 게시판 CRUD
- 비밀번호 기반 게시글 수정/삭제
- 챗봇 UI 및 `/api/chat` 연결
- 데이터 출처/라이선스 표기

## 배포 주소

- Frontend(Netlify): https://iridescent-souffle-bb2e4f.netlify.app/
- Backend(Render): https://busan-localhub-api.onrender.com
- Backend health check: https://busan-localhub-api.onrender.com/health

## 실행 방법

서버는 2개를 실행합니다.

- Backend: `http://127.0.0.1:8000`
- Frontend: `http://127.0.0.1:5173`

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```

Git Bash를 사용하는 경우:

```bash
cd /c/Users/SSAFY/Desktop/busanproject/backend
uvicorn app.main:app --port 8000
```

배포 시 프론트 도메인은 환경변수로 허용합니다.

```text
CORS_ORIGINS=https://iridescent-souffle-bb2e4f.netlify.app
```

확인:

```text
http://127.0.0.1:8000/health
```

정상 응답:

```json
{"status":"ok"}
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Git Bash를 사용하는 경우:

```bash
cd /c/Users/SSAFY/Desktop/busanproject/frontend
npm.cmd run dev
```

배포 시 백엔드 API 주소는 환경변수로 설정합니다.

```text
VITE_API_BASE_URL=https://busan-localhub-api.onrender.com
```

접속:

```text
http://127.0.0.1:5173/
```

### 서버 재시작

서버를 실행 중인 터미널에서 `Ctrl + C`를 눌러 종료한 뒤 같은 명령으로 다시 실행합니다.

Backend 재시작:

```bash
cd /c/Users/SSAFY/Desktop/busanproject/backend
uvicorn app.main:app --port 8000
```

Frontend 재시작:

```bash
cd /c/Users/SSAFY/Desktop/busanproject/frontend
npm.cmd run dev
```

### 포트 충돌 해결

이미 포트가 사용 중이면 다음 메시지가 나올 수 있습니다.

```text
Errno 10048
각 소켓 주소는 하나만 사용할 수 있습니다
```

CMD 또는 PowerShell에서 포트를 사용하는 PID를 확인합니다.

```powershell
netstat -ano | findstr :8000
netstat -ano | findstr :5173
```

`LISTENING` 줄 맨 오른쪽 PID를 종료합니다.

```powershell
taskkill /PID PID번호 /F
```

예시:

```powershell
taskkill /PID 10104 /F
```

프론트 포트만 충돌하면 다른 포트로 실행할 수도 있습니다.

```bash
cd /c/Users/SSAFY/Desktop/busanproject/frontend
npm.cmd run dev -- --port 5174
```

이 경우 접속 주소는 다음과 같습니다.

```text
http://127.0.0.1:5174/
```

## 프로젝트 구조

```text
frontend/   Vue 3 프론트엔드
backend/    FastAPI + SQLite 백엔드
busan/      TourAPI 부산 JSON 데이터
docs/       기획 문서
legacy/     초기 HTML/CSS/JS 프로토타입
```

## 배포 방법

### Backend(Render)

Render에서 Web Service를 생성합니다.

| 항목 | 값 |
|---|---|
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

환경변수:

```text
GEMINI_API_KEY=...
MODEL_NAME=gemini-2.5-flash
CORS_ORIGINS=https://iridescent-souffle-bb2e4f.netlify.app
```

배포 후 확인:

```text
https://busan-localhub-api.onrender.com/health
```

### Frontend(Netlify)

Netlify에서 GitHub 저장소를 연결합니다.

| 항목 | 값 |
|---|---|
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `frontend/dist` |

환경변수:

```text
VITE_API_BASE_URL=https://busan-localhub-api.onrender.com
```

배포 후 `CORS_ORIGINS`에 Netlify 주소를 추가하고 백엔드를 재배포합니다.

## 데이터 출처

이 서비스는 한국관광공사 Tour API(TourAPI 4.0)의 데이터를 활용하였습니다.

- 출처: 한국관광공사
- 공공데이터포털: https://www.data.go.kr/data/15101578/openapi.do
- 라이선스: 공공누리 제3유형

## 참고

- 최종 프론트엔드 기준은 `frontend/`입니다.
- `legacy/`는 초기 프로토타입 보관용입니다.
- `backend/.env`에 `GEMINI_API_KEY`를 설정하면 `/api/chat`이 Gemini API로 답변을 생성합니다.
