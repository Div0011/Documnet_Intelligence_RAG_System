from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatMessage(BaseModel):
    role: MessageRole
    content: str


class UploadResponse(BaseModel):
    filename: str
    status: str
    chunks: Optional[int] = None
    message: Optional[str] = None


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    conversation_history: list[ChatMessage] = Field(default_factory=list)


class Source(BaseModel):
    index: int
    source: str
    page: int
    text: str
    score: Optional[float] = None


class QueryResponse(BaseModel):
    answer: str
    sources: list[Source]
    insights: Optional[str] = None


class StatusResponse(BaseModel):
    total_chunks: int
    documents_indexed: int
    status: str
