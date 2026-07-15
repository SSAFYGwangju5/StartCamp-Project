# Busan LocalHub API 명세서

## 기본 정보

| 항목 | 내용 |
|---|---|
| Base URL(local) | `http://127.0.0.1:8000` |
| Framework | FastAPI |
| Response format | JSON |

## Health

### `GET /health`

서버 상태 확인용 API입니다.

응답 예시:

```json
{
  "status": "ok"
}
```

## 관광 데이터

### `GET /api/tour/{category}`

부산 TourAPI JSON 데이터를 카테고리별로 반환합니다.

| category | 설명 |
|---|---|
| `tourist` | 관광지 |
| `culture` | 문화시설 |
| `lodging` | 숙박 |
| `shopping` | 쇼핑 |
| `sports` | 레포츠 |
| `events` | 축제공연행사 |
| `courses` | 여행코스 |

응답 예시:

```json
{
  "region": "부산",
  "contentType": "관광지",
  "contentTypeId": 12,
  "total": 351,
  "items": []
}
```

## 게시판

### `GET /api/posts`

게시글 목록을 조회합니다.

응답 예시:

```json
[
  {
    "id": 1,
    "title": "해운대 근처 저녁 산책 코스 추천",
    "author": "익명",
    "views": 18,
    "created_at": "2026-07-15T00:00:00",
    "updated_at": null
  }
]
```

### `POST /api/posts`

게시글을 생성합니다.

요청 예시:

```json
{
  "title": "부산 여행 질문",
  "content": "비 오는 날 갈 만한 곳 있나요?",
  "password": "1234"
}
```

응답:

- `201 Created`
- 생성된 게시글 상세

### `GET /api/posts/{post_id}`

게시글 상세를 조회합니다. 조회 시 조회수가 1 증가합니다.

응답 예시:

```json
{
  "id": 1,
  "title": "부산 여행 질문",
  "author": "익명",
  "views": 1,
  "created_at": "2026-07-15T00:00:00",
  "updated_at": null,
  "content": "비 오는 날 갈 만한 곳 있나요?"
}
```

### `PUT /api/posts/{post_id}`

비밀번호 검증 후 게시글을 수정합니다.

요청 예시:

```json
{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "password": "1234"
}
```

오류:

- `403`: 비밀번호 불일치
- `404`: 게시글 없음

### `DELETE /api/posts/{post_id}`

비밀번호 검증 후 게시글을 삭제합니다.

요청 예시:

```json
{
  "password": "1234"
}
```

응답:

- `204 No Content`

오류:

- `403`: 비밀번호 불일치
- `404`: 게시글 없음

## 챗봇

### `POST /api/chat`

부산 여행 관련 질문에 답변합니다.

요청 예시:

```json
{
  "message": "부산 맛집 3곳 알려줘"
}
```

응답 예시:

```json
{
  "answer": "부산 맛집 3곳을 추천해드릴게요..."
}
```

동작 방식:

- `GEMINI_API_KEY`가 있으면 Gemini API 사용
- 맛집, 날씨, 영업시간 등 최신 정보 질문은 Google Search grounding 사용
- Gemini 503 오류 시 1회 재시도
- API Key가 없으면 안내 응답 반환

## 환경변수

### Backend

```text
GEMINI_API_KEY=...
MODEL_NAME=gemini-2.5-flash
CORS_ORIGINS=http://127.0.0.1:5173
```

### Frontend

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```
