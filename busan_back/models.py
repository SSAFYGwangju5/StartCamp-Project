from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from datetime import datetime
from database import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    password = Column(String(100), nullable=False)  # 의뢰서 조건에 따라 평문 저장[cite: 1]
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    contentid = Column(String(50), unique=True, index=True)
    contenttypeid = Column(String(10))[cite: 2]
    content_type_name = Column(String(50))  # 관광지, 음식점 등
    title = Column(String(200), index=True)[cite: 2]
    addr1 = Column(String(300))[cite: 2]
    addr2 = Column(String(200))[cite: 2]
    tel = Column(String(100))[cite: 2]
    mapx = Column(Float)[cite: 2]
    mapy = Column(Float)[cite: 2]
    firstimage = Column(String(500))[cite: 2]