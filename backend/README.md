# Busan LocalHub Backend

FastAPI + SQLite 기반 API 서버입니다.

## 실행

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Git Bash에서 바로 실행:

```bash
cd /c/Users/SSAFY/Desktop/busanproject/backend
uvicorn app.main:app --port 8000
```

확인:

```text
http://127.0.0.1:8000/health
```

정상 응답:

```json
{"status":"ok"}
```

## 재시작

실행 중인 터미널에서 `Ctrl + C`로 종료한 뒤 다시 실행합니다.

```bash
uvicorn app.main:app --port 8000
```

`.env`에서 `GEMINI_API_KEY`, `MODEL_NAME`, `CORS_ORIGINS`를 바꾼 경우 반드시 백엔드를 재시작해야 합니다.

## 포트 충돌 해결

8000번 포트가 이미 사용 중이면 PID를 확인합니다.

```powershell
netstat -ano | findstr :8000
```

`LISTENING` 줄 맨 오른쪽 PID를 종료합니다.

```powershell
taskkill /PID PID번호 /F
```

예시:

```powershell
taskkill /PID 10104 /F
```

## API

- `GET /health`
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/{post_id}`
- `PUT /api/posts/{post_id}`
- `DELETE /api/posts/{post_id}`
- `POST /api/chat`

## 참고

- SQLite DB 파일은 `backend/localhub.db`로 생성됩니다.
- `GEMINI_API_KEY`가 없으면 `/api/chat`은 안내 응답을 반환합니다.
- `MODEL_NAME` 기본값은 `gemini-2.5-flash`입니다.
- 배포 프론트 도메인은 `CORS_ORIGINS` 환경변수에 쉼표로 구분해 추가합니다.
