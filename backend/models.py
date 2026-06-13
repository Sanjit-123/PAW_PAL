from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
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

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    sender = Column(String) # "user" or "bot"
    text = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    # Analytics data (only populated for user messages, null for bot)
    sentiment = Column(String, nullable=True) 
    stress_score = Column(Integer, nullable=True)
    stress_level = Column(String, nullable=True)
    action = Column(String, nullable=True)
    expression = Column(String, nullable=True)
    reaction_emoji = Column(String, nullable=True)
