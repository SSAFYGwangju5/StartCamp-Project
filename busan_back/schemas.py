from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class PostBase(BaseModel):
    title: str
    content: str

class PostCreate(PostBase):
    password: str

class PostUpdate(PostBase):
    pass

class PostResponse(PostBase):
    id: int
    view_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class PasswordVerify(BaseModel):
    password: str

class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []

class LocationStat(BaseModel):
    category: str
    count: int