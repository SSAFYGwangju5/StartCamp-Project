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

## 실행 방법

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```

배포 시 프론트 도메인은 환경변수로 허용합니다.

```text
CORS_ORIGINS=https://your-netlify-site.netlify.app
```

확인:

```text
http://127.0.0.1:8000/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

배포 시 백엔드 API 주소는 환경변수로 설정합니다.

```text
VITE_API_BASE_URL=https://your-render-api.onrender.com
```

접속:

```text
http://127.0.0.1:5173/
```

## 프로젝트 구조

```text
frontend/   Vue 3 프론트엔드
backend/    FastAPI + SQLite 백엔드
busan/      TourAPI 부산 JSON 데이터
docs/       기획 문서
legacy/     초기 HTML/CSS/JS 프로토타입
```

## 데이터 출처

이 서비스는 한국관광공사 Tour API(TourAPI 4.0)의 데이터를 활용하였습니다.

- 출처: 한국관광공사
- 공공데이터포털: https://www.data.go.kr/data/15101578/openapi.do
- 라이선스: 공공누리 제3유형

## 참고

- 최종 프론트엔드 기준은 `frontend/`입니다.
- `legacy/`는 초기 프로토타입 보관용입니다.
- OpenAI API 연동 전까지 `/api/chat`은 더미 응답을 반환합니다.
