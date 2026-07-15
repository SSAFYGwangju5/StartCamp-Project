from datetime import datetime
import json
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import SessionLocal, get_db, init_db
from .models import Post
from .schemas import ChatRequest, ChatResponse, PostCreate, PostDelete, PostDetail, PostListItem, PostUpdate


app = FastAPI(title="Busan LocalHub API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
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
    return {
        "answer": (
            f"'{message}'에 대한 답변은 OpenAI API 연결 후 더 정확히 제공할 예정입니다. "
            "지금은 부산 관광지, 축제/행사, 여행코스 데이터를 먼저 확인해보세요."
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

    data_path = Path(__file__).resolve().parents[2] / "busan" / filename
    return json.loads(data_path.read_text(encoding="utf-8"))
