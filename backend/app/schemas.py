from datetime import datetime

from pydantic import BaseModel, Field


class PostBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)


class PostCreate(PostBase):
    password: str = Field(min_length=1, max_length=100)


class PostUpdate(PostBase):
    password: str = Field(min_length=1, max_length=100)


class PostDelete(BaseModel):
    password: str = Field(min_length=1, max_length=100)


class PostListItem(BaseModel):
    id: int
    title: str
    author: str
    views: int
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class PostDetail(PostListItem):
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)


class ChatResponse(BaseModel):
    answer: str
