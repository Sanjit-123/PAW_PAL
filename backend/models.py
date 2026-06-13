from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, default="AnonymousStudent")
    paw_points = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    current_stress_level = Column(String, default="Low")

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    entry_text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    # AI Analysis Results
    sentiment = Column(String) # positive, neutral, negative
    stress_score = Column(Integer) # 0-100
    stress_level = Column(String) # Low, Moderate, High
