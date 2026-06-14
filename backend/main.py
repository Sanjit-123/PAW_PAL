from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import database
import models
import schemas
from ai_engine import analyze_journal, generate_bot_response, generate_embedding, synthesize_themes, generate_weekly_letter
from vector_db import add_journal_vector, get_all_journals_from_vector_db, search_similar_journals

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
    db.commit()
    db.refresh(db_entry)
    
    # 3. Add to Vector DB
    try:
        embedding = generate_embedding(entry.entry_text)
        add_journal_vector(
            entry_id=db_entry.id,
            text=entry.entry_text,
            metadata={
                "sentiment": analysis["sentiment"],
                "stress_level": analysis["stress_level"]
            },
            embedding=embedding
        )
    except Exception as e:
        print(f"Vector DB error: {e}")

    # 4. Update User's current stress level (simplified: just take the latest)
    user = db.query(models.User).filter(models.User.id == 1).first()
    user.current_stress_level = analysis["stress_level"]
    # Reward for journaling!
    user.paw_points += 10 
    
    db.commit()

    return db_entry

@app.get("/api/journal/history", response_model=List[schemas.JournalResponse])
def get_journal_history(db: Session = Depends(get_db)):
    return db.query(models.JournalEntry).order_by(models.JournalEntry.timestamp.desc()).all()

@app.get("/api/chat/history", response_model=List[schemas.ChatResponse])
def get_chat_history(db: Session = Depends(get_db)):
    return db.query(models.ChatMessage).order_by(models.ChatMessage.timestamp.asc()).all()

@app.post("/api/chat", response_model=List[schemas.ChatResponse])
def send_chat_message(chat: schemas.ChatCreate, db: Session = Depends(get_db)):
    # 1. Analyze user message
    analysis = analyze_journal(chat.text)

    # 2. Save User Message
    user_msg = models.ChatMessage(
        user_id=1,
        sender="user",
        text=chat.text,
        sentiment=analysis["sentiment"],
        stress_score=analysis["stress_score"],
        stress_level=analysis["stress_level"]
    )
    db.add(user_msg)

    # Fetch last 5 messages for context
    history = db.query(models.ChatMessage).order_by(models.ChatMessage.timestamp.desc()).limit(5).all()
    history.reverse()
    formatted_history = [{"sender": h.sender, "text": h.text} for h in history]

    # Semantic Search for Relevant Past Journals
    context_journals = []
    try:
        chat_embedding = generate_embedding(chat.text)
        search_results = search_similar_journals(chat_embedding, n_results=2)
        if search_results and 'documents' in search_results and search_results['documents']:
            context_journals = search_results['documents'][0] # documents is a list of lists in Chroma
    except Exception as e:
        print(f"Failed to fetch context journals: {e}")

    # 3. Generate and Save Bot Message
    bot_reply_data = generate_bot_response(chat.text, analysis, formatted_history, context_journals)
    bot_msg = models.ChatMessage(
        user_id=1,
        sender="bot",
        text=bot_reply_data.get("text", "Bark!"),
        action=bot_reply_data.get("action", "tail_wag"),
        expression=bot_reply_data.get("expression", "normal"),
        reaction_emoji=bot_reply_data.get("reaction_emoji", "")
    )
    db.add(bot_msg)

    # 4. Update User's stress level and points
    user = db.query(models.User).filter(models.User.id == 1).first()
    user.current_stress_level = analysis["stress_level"]
    user.paw_points += 5 # smaller reward for chatting than journaling

    db.commit()
    db.refresh(user_msg)
    db.refresh(bot_msg)

    return [user_msg, bot_msg]

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

@app.get("/api/analytics/themes")
def get_analytics_themes():
    try:
        results = get_all_journals_from_vector_db()
        documents = results.get("documents", [])
        if not documents:
            return {"themes": []}
        
        # Synthesize themes
        insights = synthesize_themes(documents)
        return insights
    except Exception as e:
        print(f"Analytics themes error: {e}")
        return {"themes": []}

@app.get("/api/letters", response_model=List[schemas.PawPalLetterResponse])
def get_letters(db: Session = Depends(get_db)):
    return db.query(models.PawPalLetter).filter(models.PawPalLetter.user_id == 1).order_by(models.PawPalLetter.timestamp.desc()).all()

@app.post("/api/letters/generate", response_model=schemas.PawPalLetterResponse)
def generate_new_letter(db: Session = Depends(get_db)):
    # Fetch recent journals from DB (or vector DB). Let's use SQLite for exact text.
    recent_journals = db.query(models.JournalEntry).order_by(models.JournalEntry.timestamp.desc()).limit(15).all()
    journal_texts = [j.entry_text for j in recent_journals]
    
    letter_content = generate_weekly_letter(journal_texts)
    
    new_letter = models.PawPalLetter(
        user_id=1,
        content=letter_content
    )
    db.add(new_letter)
    db.commit()
    db.refresh(new_letter)
    
    return new_letter
