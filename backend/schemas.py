from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class JournalCreate(BaseModel):
    entry_text: str

class JournalResponse(JournalCreate):
    id: int
    timestamp: datetime
    sentiment: str
    stress_score: int
    stress_level: str

    class Config:
        from_attributes = True

class ChatCreate(BaseModel):
    text: str

class ChatResponse(BaseModel):
    id: int
    sender: str
    text: str
    timestamp: datetime
    sentiment: Optional[str] = None
    stress_score: Optional[int] = None
    stress_level: Optional[str] = None
    action: Optional[str] = None
    expression: Optional[str] = None
    reaction_emoji: Optional[str] = None

    class Config:
        orm_mode = True

class UserResponse(BaseModel):
    id: int
    username: str
    paw_points: int
    streak_days: int
    current_stress_level: str

    class Config:
        from_attributes = True
