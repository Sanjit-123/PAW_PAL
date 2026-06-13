from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import database
import models
import schemas
from ai_engine import analyze_journal

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="PawPal Backend")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev, allow all. In prod, lock this to the React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    # Create the default Anonymous user if it doesn't exist
    db = database.SessionLocal()
    user = db.query(models.User).filter(models.User.id == 1).first()
    if not user:
        new_user = models.User(id=1, username="AnonymousStudent", paw_points=0, streak_days=0, current_stress_level="Low")
        db.add(new_user)
        db.commit()
    db.close()

@app.get("/api/user/status", response_model=schemas.UserResponse)
def get_user_status(db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == 1).first()
    return user

@app.post("/api/journal", response_model=schemas.JournalResponse)
def create_journal_entry(entry: schemas.JournalCreate, db: Session = Depends(get_db)):
    # 1. Analyze with AI
    analysis = analyze_journal(entry.entry_text)

    # 2. Save entry
    db_entry = models.JournalEntry(
        user_id=1,
        entry_text=entry.entry_text,
        sentiment=analysis["sentiment"],
        stress_score=analysis["stress_score"],
        stress_level=analysis["stress_level"]
    )
    db.add(db_entry)
    
    # 3. Update User's current stress level (simplified: just take the latest)
    user = db.query(models.User).filter(models.User.id == 1).first()
    user.current_stress_level = analysis["stress_level"]
    # Reward for journaling!
    user.paw_points += 10 
    
    db.commit()
    db.refresh(db_entry)

    return db_entry

@app.get("/api/journal/history", response_model=List[schemas.JournalResponse])
def get_journal_history(db: Session = Depends(get_db)):
    return db.query(models.JournalEntry).order_by(models.JournalEntry.timestamp.desc()).all()

@app.get("/api/resources")
def get_resources(stress_level: str = "Low"):
    # Mock resources database based on stress level
    resources = {
        "High": [
            {"title": "National Crisis Hotline", "url": "#", "type": "Urgent"},
            {"title": "Campus Counseling Services", "url": "#", "type": "Counseling"},
            {"title": "Grounding Techniques for Panic", "url": "#", "type": "Self-Help"}
        ],
        "Moderate": [
            {"title": "Guided 10-Minute Meditation", "url": "#", "type": "Meditation"},
            {"title": "Time Management Workshops", "url": "#", "type": "Workshop"},
            {"title": "Peer Support Group", "url": "#", "type": "Community"}
        ],
        "Low": [
            {"title": "Daily Gratitude Prompts", "url": "#", "type": "Wellness"},
            {"title": "Healthy Sleep Habits", "url": "#", "type": "Self-Help"},
            {"title": "Yoga for Students", "url": "#", "type": "Fitness"}
        ]
    }
    # Fallback to Low if invalid
    return resources.get(stress_level, resources["Low"])
