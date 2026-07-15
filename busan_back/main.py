from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json, os
from openai import OpenAI
import models, schemas, crud
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LocalHub Busan Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터 백포퓰레이션 (초기 가동 시 JSON 데이터를 SQLite에 파싱 및 적재)
@app.on_event("startup")
def preload_data():
    db = next(get_db())
    if db.query(models.Location).count() == 0:
        data_dir = "./data"
        if not os.path.exists(data_dir):
            return
        
        # 콘텐츠 유형 ID 매핑 테이블[cite: 2]
        type_map = {
            "12": "관광지", "14": "문화시설", "15": "축제공연행사",
            "25": "여행코스", "28": "레포츠", "32": "숙박",
            "38": "쇼핑", "39": "음식점"
        }[cite: 2]

        for file_name in os.listdir(data_dir):
            if file_name.endswith(".json"):
                with open(os.path.join(data_dir, file_name), "r", encoding="utf-8") as f:
                    content = json.load(f)
                    items = content.get("items", [])[cite: 2]
                    for item in items:
                        # 위도 경도 예외처리 및 형변환[cite: 2]
                        try:
                            mx = float(item.get("mapx")) if item.get("mapx") else 0.0[cite: 2]
                            my = float(item.get("mapy")) if item.get("mapy") else 0.0[cite: 2]
                        except ValueError:
                            mx, my = 0.0, 0.0

                        ct_id = item.get("contenttypeid", "12")[cite: 2]
                        loc = models.Location(
                            contentid=item.get("contentid"),[cite: 2]
                            contenttypeid=ct_id,[cite: 2]
                            content_type_name=type_map.get(ct_id, "기타"),
                            title=item.get("title"),[cite: 2]
                            addr1=item.get("addr1", ""),[cite: 2]
                            addr2=item.get("addr2", ""),[cite: 2]
                            tel=item.get("tel", ""),[cite: 2]
                            mapx=mx,                          # 키워드 인자 선언 확인
                            mapy=my,                          # 반드시 앞에 'mapy=' 가 누락되지 않았는지 체크!
                            firstimage=item.get("firstimage", "")[cite: 2]
                        )
                        db.merge(loc)
        db.commit()

# --- 커뮤니티 API 엔드포인트 ---
@app.get("/api/posts", response_model=dict)
def read_posts(search: Optional[str] = None, page: int = 1, limit: int = 10, db: Session = Depends(get_db)):
    skip = (page - 1) * limit
    items, total = crud.get_posts(db, search, skip, limit)
    return {"items": items, "total": total, "page": page, "limit": limit}

@app.get("/api/posts/{post_id}", response_model=schemas.PostResponse)
def read_post(post_id: int, db: Session = Depends(get_db)):
    post = crud.get_post(db, post_id, increment_view=True)
    if not post:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    return post

@app.post("/api/posts", response_model=schemas.PostResponse)
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db)):
    return crud.create_post(db, post)

@app.put("/api/posts/{post_id}", response_model=schemas.PostResponse)
def update_post(post_id: int, post_data: schemas.PostCreate, db: Session = Depends(get_db)):
    db_post = crud.get_post(db, post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="게시글이 존재하지 않습니다.")
    if db_post.password != post_data.password:
        raise HTTPException(status_code=403, detail="비밀번호가 일치하지 않습니다.")
    return crud.update_post(db, post_id, post_data)

@app.delete("/api/posts/{post_id}")
def delete_post(post_id: int, verify: schemas.PasswordVerify, db: Session = Depends(get_db)):
    db_post = crud.get_post(db, post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="게시글이 존재하지 않습니다.")
    if db_post.password != verify.password:
        raise HTTPException(status_code=403, detail="비밀번호가 일치하지 않습니다.")
    crud.delete_post(db, post_id)
    return {"message": "성공적으로 삭제되었습니다."}

# --- 대시보드 통계 API 엔드포인트 ---
@app.get("/api/locations/stats", response_model=List[schemas.LocationStat])
def get_stats(db: Session = Depends(get_db)):
    return crud.get_location_stats(db)

# --- 자연어 지역 정보 질의응답 챗봇 API ---
@app.post("/api/chat")
def chat_bot(payload: schemas.ChatRequest, db: Session = Depends(get_db)):
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        return {"response": "서버 환경변수에 OpenAI API Key가 설정되지 않았습니다."}
    
    client = OpenAI(api_key=openai_key)
    
    # 챗봇 자연어 형태소 추출 대안으로 간단한 키워드 연동 로컬 지식기반 컨텍스트 빌딩
    user_msg = payload.message
    keywords = [word for word in user_msg.split() if len(word) > 1]
    
    context_str = ""
    if keywords:
        # 첫 번째 핵심 키워드로 데이터베이스에서 정보 조회
        matched_items = crud.search_locations_by_keyword(db, keywords[0], limit=5)
        if matched_items:
            context_str = "\n[질의 관련 부산 지역 수집 데이터 정보]:\n"
            for idx, loc in enumerate(matched_items, 1):
                context_str += f"{idx}. {loc.title} ({loc.content_type_name}) - 주소: {loc.addr1}, 전화번호: {loc.tel if loc.tel else '없음'}\n"

    # OpenAI System 프롬프트 구성
    system_prompt = (
        "너는 부산 지역 정보 공유 커뮤니티 'LocalHub'의 전문 AI 안내원이야.\n"
        "제공된 데이터베이스 컨텍스트 정보를 최우선으로 참고하여 사용자의 질문에 정확하고 친절하게 답변해줘.\n"
        "출처 요구 시 반드시 '출처: 한국관광공사 TourAPI 4.0' 및 '라이선스: 공공누리 제3유형' 명세를 누락 없이 안내해야 해.\n"
        f"익명 커뮤니티 게시글 검색이나 관광지 추천 요청 시에도 적극 대응해줘.\n{context_str}"
    )[cite: 1, 3]

    messages = [{"role": "system", "content": system_prompt}]
    for h in payload.history:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": user_msg})

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=500
        )
        return {"response": completion.choices[0].message.content}
    except Exception as e:
        return {"response": f"챗봇 응답 처리 중 오류가 발생했습니다: {str(e)}"}