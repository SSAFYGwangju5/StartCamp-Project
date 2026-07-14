# LocalHub Backend

Node.js + Express + SQLite 기반 지역정보 커뮤니티 백엔드

## 설치 방법

1. 프로젝트 루트로 이동
```bash
cd backend
```
2. 의존성 설치
```bash
npm install
```

## 실행 방법

개발
```bash
npm run dev
```

운영
```bash
npm start
```

## 환경변수

`.env` 파일에 아래를 추가합니다.

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
```

## 폴더 구조

```
backend/
├─ data/
│  └─ localhub.db
├─ src/
│  ├─ app.js
│  ├─ db.js
│  ├─ controllers/
│  │  └─ postsController.js
│  ├─ middleware/
│  │  └─ errorHandler.js
│  ├─ routes/
│  │  └─ posts.js
│  └─ utils/
│     └─ asyncHandler.js
├─ .env.example
├─ .gitignore
├─ package.json
└─ README.md
```

## API 목록

### 게시글 목록 조회

`GET /api/posts`

쿼리 파라미터:
- `keyword`: 제목 또는 내용 검색
- `category`: 카테고리 필터
- `page`: 페이지 번호 (기본 1)
- `limit`: 페이지당 항목 수 (기본 10)

응답:
```json
{
  "posts": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

### 게시글 상세 조회

`GET /api/posts/:id`

### 게시글 작성

`POST /api/posts`

요청 바디:
```json
{
  "title": "부산 맛집 추천",
  "content": "광안리 맛집입니다.",
  "password": "1234",
  "category": "맛집"
}
```

### 게시글 수정

`PUT /api/posts/:id`

요청 바디:
```json
{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "password": "1234",
  "category": "맛집"
}
```

### 게시글 삭제

`DELETE /api/posts/:id`

요청 바디:
```json
{
  "password": "1234"
}
```

### 게시글 좋아요

`POST /api/posts/:id/like`

응답:
```json
{
  "id": 1,
  "like_count": 1
}
```

## 요청 예시

게시글 목록 조회
```bash
curl "http://localhost:3000/api/posts?page=1&limit=10&keyword=맛집&category=맛집"
```

게시글 작성
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"부산 맛집","content":"광안리 추천","password":"1234","category":"맛집"}'
```

좋아요 증가
```bash
curl -X POST http://localhost:3000/api/posts/1/like
```

## Render 배포 방법

Render에서 Node.js 서비스로 배포합니다.

- Start Command: `npm start`
- Build Command: 없음
- Root: `backend`
- Environment:
  - `PORT`: `3000`
  - `FRONTEND_URL`: `http://localhost:5173`

서버는 `process.env.PORT`와 `0.0.0.0`에 바인딩되도록 구성되어 있습니다.

## SQLite DB 위치

`backend/data/localhub.db`

## 주의사항

- `.env` 파일은 GitHub에 커밋하지 마세요.
- `node_modules/`, `.env`, `*.db`는 `.gitignore`에 등록되어 있습니다.
- 비밀번호는 API 응답에서 절대 포함되지 않습니다.
