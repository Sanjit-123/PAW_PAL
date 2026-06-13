from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class JournalCreate(BaseModel):
    entry_text: str

class JournalResponse(BaseModel):
    id: int
    entry_text: str
    timestamp: datetime
    sentiment: str
    stress_score: int
    stress_level: str

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    username: str
    paw_points: int
    streak_days: int
    current_stress_level: str

    class Config:
        from_attributes = True
