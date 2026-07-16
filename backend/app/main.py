from datetime import datetime
import json
import logging
import os
from pathlib import Path
import time

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import SessionLocal, get_db, init_db
from .models import Post
from .schemas import ChatRequest, ChatResponse, PostCreate, PostDelete, PostDetail, PostListItem, PostUpdate


BACKEND_DIR = Path(__file__).resolve().parents[1]
PROJECT_DIR = Path(__file__).resolve().parents[2]

load_dotenv(BACKEND_DIR / ".env")

app = FastAPI(title="Busan LocalHub API")
logger = logging.getLogger("busan-localhub")

default_origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5174",
    "http://localhost:5174",
]
env_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()]
allowed_origins = default_origins + env_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()
    seed_posts()


def seed_posts():
    with SessionLocal() as db:
        existing_post = db.scalar(select(Post).limit(1))
        if existing_post is not None:
            return

        db.add_all(
            [
                Post(
                    title="해운대 근처 저녁 산책 코스 추천",
                    content=(
                        "저녁에는 해운대 해수욕장에서 동백섬 방향으로 걷는 코스를 추천합니다. "
                        "바다 쪽 산책로가 잘 정비되어 있고, 시간이 맞으면 마린시티 야경까지 함께 보기 좋습니다."
                    ),
                    password="1234",
                    views=18,
                ),
                Post(
                    title="비 오는 날 가기 좋은 실내 관광지 있나요?",
                    content=(
                        "비가 오면 부산현대미술관, 국립해양박물관, 영화의전당 같은 실내 중심 장소를 묶어서 움직이면 편합니다. "
                        "이동 거리가 길어지지 않게 권역을 하나로 잡는 게 좋아요."
                    ),
                    password="1234",
                    views=9,
                ),
            ]
        )
        db.commit()


@app.get("/health")
def health():
    return {"status": "ok"}


def build_tour_context(message: str):
    data_dir = PROJECT_DIR / "busan"
    context_parts = []
    normalized_message = message.replace(" ", "").replace("박랍회", "박람회")
    category_files = {
        "관광지": "부산_관광지.json",
        "문화시설": "부산_문화시설.json",
        "숙박": "부산_숙박.json",
        "쇼핑": "부산_쇼핑.json",
        "레포츠": "부산_레포츠.json",
        "축제공연행사": "부산_축제공연행사.json",
        "여행코스": "부산_여행코스.json",
    }
    keyword_map = {
        "숙박": ["숙박", "호텔", "숙소", "잠", "1박", "게스트"],
        "축제공연행사": ["축제", "행사", "공연", "페스티벌", "박람회", "박랍회", "기간", "언제"],
        "여행코스": ["코스", "일정", "루트", "당일치기"],
        "문화시설": ["문화", "박물관", "미술관", "실내", "비"],
        "쇼핑": ["쇼핑", "시장", "기념품", "가게"],
        "레포츠": ["레포츠", "체험", "액티비티", "운동"],
        "관광지": ["관광", "가볼", "명소", "바다", "전망", "산책"],
    }

    selected_categories = [
        category
        for category, keywords in keyword_map.items()
        if any(keyword in message for keyword in keywords)
    ]
    if not selected_categories:
        selected_categories = ["관광지", "축제공연행사", "여행코스"]

    if any(keyword in message for keyword in ["맛집", "음식", "식당", "밥", "카페"]):
        context_parts.append(
            "주의: 현재 앱 데이터에는 음식점 전용 JSON 파일이 없습니다. "
            "맛집 질문에는 음식점 이름을 지어내지 말고, 앱에 있는 관광지/시장/여행코스 중심으로 안내하세요."
        )

    for category in selected_categories[:4]:
        file_name = category_files[category]
        data = json.loads((data_dir / file_name).read_text(encoding="utf-8"))
        item_summaries = []
        items = data.get("items", [])
        matched_items = []
        for item in items:
            title = item.get("title", "")
            normalized_title = title.replace(" ", "").replace("박랍회", "박람회")
            title_terms = [term for term in normalized_title.replace("2026", "").replace("2025", "").split("/") if len(term) >= 3]
            if normalized_title and (normalized_title in normalized_message or any(term and term in normalized_message for term in title_terms)):
                matched_items.append(item)

        summary_items = matched_items[:8] + [item for item in items[:15] if item not in matched_items]
        for item in summary_items[:20]:
            title = item.get("title", "")
            address = item.get("addr1", "")
            event_place = item.get("eventplace", "")
            if title:
                detail = event_place or address
                if category == "축제공연행사":
                    start_date = item.get("eventstartdate", "")
                    end_date = item.get("eventenddate", "")
                    if start_date and end_date:
                        detail = f"{start_date[:4]}.{start_date[4:6]}.{start_date[6:8]}~{end_date[:4]}.{end_date[4:6]}.{end_date[6:8]}, {detail}"
                item_summaries.append(f"{title}({detail})" if detail else title)
        context_parts.append(f"{data.get('contentType')}: {', '.join(item_summaries)}")

    return "\n".join(context_parts)


def should_use_search(message: str):
    search_keywords = [
        "맛집",
        "음식",
        "식당",
        "카페",
        "날씨",
        "영업",
        "운영",
        "휴무",
        "가격",
        "요금",
        "현재",
        "오늘",
        "내일",
        "실시간",
        "근처",
    ]
    return any(keyword in message for keyword in search_keywords)


def is_food_question(message: str):
    return any(keyword in message for keyword in ["맛집", "음식", "식당", "밥", "카페", "먹거리", "가볼만한 곳"])


def fallback_food_answer():
    return (
        "지금 AI 검색 응답이 불안정해서 기본 추천으로 안내할게요.\n"
        "1. 국제시장 먹자골목: 씨앗호떡, 분식, 길거리 음식을 함께 둘러보기 좋아요.\n"
        "2. 청사포 횟집촌: 바다 근처에서 해산물이나 회를 먹기 좋은 권역이에요.\n"
        "3. 금정산성마을 먹거리촌: 산책이나 등산 후 막걸리와 향토 음식을 즐기기 좋아요.\n"
        "운영시간과 휴무는 방문 전에 한 번 더 확인해 주세요."
    )


@app.get("/api/posts", response_model=list[PostListItem])
def list_posts(db: Session = Depends(get_db)):
    posts = db.scalars(select(Post).order_by(Post.id.desc())).all()
    return posts


@app.post("/api/posts", response_model=PostDetail, status_code=status.HTTP_201_CREATED)
def create_post(payload: PostCreate, db: Session = Depends(get_db)):
    post = Post(title=payload.title.strip(), content=payload.content.strip(), password=payload.password)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@app.get("/api/posts/{post_id}", response_model=PostDetail)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")

    post.views += 1
    db.commit()
    db.refresh(post)
    return post


@app.put("/api/posts/{post_id}", response_model=PostDetail)
def update_post(post_id: int, payload: PostUpdate, db: Session = Depends(get_db)):
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    if post.password != payload.password:
        raise HTTPException(status_code=403, detail="비밀번호가 일치하지 않습니다.")

    post.title = payload.title.strip()
    post.content = payload.content.strip()
    post.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(post)
    return post


@app.delete("/api/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, payload: PostDelete, db: Session = Depends(get_db)):
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    if post.password != payload.password:
        raise HTTPException(status_code=403, detail="비밀번호가 일치하지 않습니다.")

    db.delete(post)
    db.commit()
    return None


@app.post("/api/chat", response_model=ChatResponse)
def chat(payload: ChatRequest):
    message = payload.message.strip()
    api_key = os.getenv("GEMINI_API_KEY")
    model = os.getenv("MODEL_NAME", "gemini-2.5-flash")

    if not api_key:
        return {
            "answer": (
                f"'{message}'에 대한 답변은 Gemini API 키 설정 후 더 정확히 제공할 예정입니다. "
                "지금은 부산 관광지, 축제/행사, 여행코스 데이터를 먼저 확인해보세요."
            )
        }

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        use_search = should_use_search(message)
        system_instruction = (
            "모든 답변에 성실하게 답하는 챗봇이다.\n"
            "너는 부산 여행 정보를 도와주는 LocalHub 챗봇이다.\n"
            "답변은 한국어로, 짧고 실용적으로 한다.\n"
            "사용자 질문에는 가능한 한 항상 도움 되는 답변을 한다.\n"
            "앱 데이터에 있는 장소, 숙소, 축제, 여행코스는 우선 활용한다.\n"
            "앱 데이터에 없는 장소명, 숙소명, 맛집명은 지어내지 않는다.\n"
            "Google 검색 도구가 제공된 경우 최신 정보가 필요한 질문은 검색 결과를 참고해서 답한다.\n"
            "맛집이나 카페를 묻는 경우 검색 결과를 참고해 실제 상호명 3곳, 대표 메뉴나 특징, 위치 권역을 알려준다.\n"
            "검색을 사용하지 못하거나 정보가 불확실하면 확인이 필요하다고 말하고 확인 방법을 안내한다.\n"
        )
        prompt = (
            f"사용자 질문: {message}\n\n"
            "앱에 포함된 부산 데이터 일부:\n"
            f"{build_tour_context(message)}\n\n"
            "맛집, 날씨, 영업시간처럼 최신 확인이 필요한 질문이면 검색 결과를 활용해 답하세요. "
            "맛집 질문에는 가능한 한 실제 식당 상호명을 중심으로 답하세요. "
            "답변 끝에는 중요한 최신 정보는 방문 전 재확인이 필요하다고 짧게 덧붙이세요."
        )
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            tools=[types.Tool(google_search=types.GoogleSearch())] if use_search else None,
        )
        response = None
        last_error = None
        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=config,
                )
                break
            except Exception as exc:
                last_error = exc
                logger.warning(
                    "Gemini generate_content failed. attempt=%s model=%s use_search=%s error=%r",
                    attempt + 1,
                    model,
                    use_search,
                    exc,
                )
                if "503" not in str(exc) and "UNAVAILABLE" not in str(exc):
                    raise
                if attempt == 0:
                    time.sleep(1)

        if response is None:
            logger.error(
                "Gemini returned no response. model=%s use_search=%s last_error=%r",
                model,
                use_search,
                last_error,
            )
            if is_food_question(message):
                return {"answer": fallback_food_answer()}
            return {
                "answer": (
                    "현재 Gemini 응답이 일시적으로 지연되고 있습니다. "
                    "잠시 후 다시 질문해 주세요. 관광지, 축제, 숙박, 여행코스 목록은 계속 이용할 수 있습니다."
                )
            }

        answer = (response.text or "").strip()
        return {"answer": answer or "답변을 생성하지 못했습니다. 다시 질문해 주세요."}
    except Exception as exc:
        logger.exception("Chat answer generation failed. model=%s message=%r", model, message)
        if is_food_question(message):
            return {"answer": fallback_food_answer()}
        return {
            "answer": (
                "챗봇 답변 생성 중 오류가 발생했습니다. "
                "잠시 후 다시 시도하거나 관광지/축제/숙박/여행코스 목록을 먼저 확인해 주세요."
            )
        }


@app.get("/api/tour/{category}")
def tour_data(category: str):
    file_map = {
        "tourist": "부산_관광지.json",
        "culture": "부산_문화시설.json",
        "lodging": "부산_숙박.json",
        "shopping": "부산_쇼핑.json",
        "sports": "부산_레포츠.json",
        "events": "부산_축제공연행사.json",
        "courses": "부산_여행코스.json",
    }
    filename = file_map.get(category)
    if filename is None:
        raise HTTPException(status_code=404, detail="지원하지 않는 카테고리입니다.")

    data_path = PROJECT_DIR / "busan" / filename
    return json.loads(data_path.read_text(encoding="utf-8"))
