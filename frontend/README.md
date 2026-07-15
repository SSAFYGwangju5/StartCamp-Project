# Busan LocalHub Frontend

Vue 3 + Vite 프론트엔드입니다.

## 실행

백엔드를 먼저 실행합니다.

```bash
cd ../backend
uvicorn app.main:app --port 8000
```

프론트엔드를 실행합니다.

```bash
cd ../frontend
npm install
npm run dev
```

접속 주소:

```text
http://127.0.0.1:5173/
```

## 빌드

```bash
npm run build
```

## 환경변수

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```
