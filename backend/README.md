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
- OpenAI API 연동 전까지 `/api/chat`은 더미 응답을 반환합니다.
- 배포 프론트 도메인은 `CORS_ORIGINS` 환경변수에 쉼표로 구분해 추가합니다.
