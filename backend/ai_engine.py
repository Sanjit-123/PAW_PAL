import os
import json
from textblob import TextBlob
import google.generativeai as genai
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_journal(text: str) -> dict:
    """
    Analyzes the sentiment of a journal entry and infers a stress level.
    Returns a dictionary with sentiment, stress_score, and stress_level.
    """
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity # -1.0 to 1.0
    subjectivity = blob.sentiment.subjectivity # 0.0 to 1.0

    # Determine basic sentiment
    if polarity > 0.1:
        sentiment = "positive"
    elif polarity < -0.1:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    # Calculate an arbitrary "Stress Score" from 0 to 100 based on negative polarity and subjectivity
    # High subjectivity + high negativity = High Stress
    if polarity < 0:
        base_stress = abs(polarity) * 100
        # Subjectivity amplifies it (e.g. "I am feeling awful" vs "The weather is awful")
        stress_score = int(base_stress * (0.5 + (subjectivity * 0.5)))
    else:
        # If positive, stress is low
        stress_score = max(0, int((1 - polarity) * 20))

    # Determine categorical stress level
    if stress_score > 60:
        stress_level = "High"
    elif stress_score > 30:
        stress_level = "Moderate"
    else:
        stress_level = "Low"

    return {
        "sentiment": sentiment,
        "stress_score": stress_score,
        "stress_level": stress_level
    }

def generate_bot_response(user_text: str, analysis: dict, history: list = None, context_journals: list[str] = None) -> dict:
    try:
        
        history_str = ""
        if history:
            history_str = "Recent Conversation History:\n"
            for msg in history:
                role = "User" if msg["sender"] == "user" else "PawPal"
                history_str += f"{role}: {msg['text']}\n"
        
        context_str = ""
        if context_journals and len(context_journals) > 0:
            context_str = "\nBACKGROUND MEMORY (From User's Past Journals):\n"
            for j in context_journals:
                context_str += f"- {j}\n"
            context_str += "\nUse this background memory silently to inform your empathy. Do NOT explicitly say 'I read your journal'. Just weave your understanding of their past struggles/themes into your comforting response."

        prompt = f"""
You are PawPal, an empathetic, comforting, and non-judgmental digital pet dog supporting a college student.
The user's inferred current emotional state: {analysis['sentiment']}
The user's inferred stress level: {analysis['stress_level']}
{context_str}

{history_str}

The user says: "{user_text}"

You must respond with valid JSON matching this schema:
{{
  "text": "Your supportive, gentle response (1 to 3 short sentences)",
  "action": "One of: tail_wag, head_tilt, ears_down, excited_jump, nod_yes, shake_no, shiver, spin, ears_perk, lie_down, panting",
  "expression": "One of: happy, sad, curious, sleepy, normal, angry, shocked, loving, confused, excited, anxious, playful",
  "reaction_emoji": "A single text prefix combining an animal/emoji and an emotion symbol, e.g., '🐶💗 Supportive', '🐶✨ Excited', '🐶😴 Calm', '🐶🌧 Concerned'"
}}

IMPORTANT - Map the user's emotional tone to your expression:
- If user tone is joyful/excited -> expression: playful | excited, action: excited_jump | spin | tail_wag
- If user tone is sad/depressed -> expression: sad | loving, action: ears_down | lie_down
- If user tone is stressed/anxious -> expression: anxious | normal, action: shiver | panting
- If user tone is angry/frustrated -> expression: sad | shocked, action: ears_down
- If user tone is curious/asking -> expression: curious | confused, action: head_tilt
- If user tone is affectionate -> expression: loving | sleepy, action: tail_wag | nod_yes

Choose the action and expression that best fits the emotional tone of your reply, ensuring you rigorously apply the correct animation mapping.
        """
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": prompt
                }
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"},
        )
        response_text = chat_completion.choices[0].message.content
        data = json.loads(response_text)
        return data
    except Exception as e:
        print(f"Gemini API Error: {e}")
        # Fallback to simple rule-engine if API fails
        return {
            "text": "I'm always here to listen, friend. Tell me more about what's on your mind. 🐾",
            "action": "tail_wag",
            "expression": "normal"
        }

def generate_embedding(text: str) -> list[float]:
    """Generates a text embedding using Gemini."""
    try:
        result = genai.embed_content(
            model="models/embedding-001",
            content=text,
            task_type="retrieval_document",
        )
        return result['embedding']
    except Exception as e:
        print(f"Gemini Embedding Error: {e}")
        # Return a zero vector of size 768 as fallback
        return [0.0] * 768

def synthesize_themes(documents: list[str]) -> dict:
    """Uses Groq to summarize the recurring themes from the vector DB."""
    if not documents:
        return {"themes": []}
    try:
        docs_str = "\n".join([f"- {doc}" for doc in documents[:50]]) # Limit to latest 50 to avoid token limits
        prompt = f"""
        Analyze these recent journal entries from a user:
        {docs_str}

        Identify the top 1 to 3 recurring themes or topics.
        Return valid JSON matching this schema exactly:
        {{
            "themes": [
                {{
                    "topic": "The theme name (e.g. Academics, Social Life, Sleep)",
                    "insight": "A brief, encouraging insight about how this theme affects their mood.",
                    "stress_association": "High, Moderate, or Low"
                }}
            ]
        }}
        """
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"},
        )
        response_text = chat_completion.choices[0].message.content
        return json.loads(response_text)
    except Exception as e:
        print(f"Gemini Theme Synthesis Error: {e}")
        return {"themes": []}

def generate_weekly_letter(journal_entries: list[str]) -> str:
    """Uses Groq to generate an empathetic weekly letter from PawPal based on recent journals."""
    try:
        # Use at most the last 30 entries for context
        docs_str = "\n".join([f"- {doc}" for doc in journal_entries[:30]])
        prompt = f"""
        You are PawPal, an empathetic, deeply compassionate digital pet dog supporting a college student.
        Your goal is to write a short "Weekly Letter" to the student based on their recent journal entries.

        Recent Journal Entries:
        {docs_str}

        Instructions:
        1. Write a warm, encouraging letter (around 3-5 sentences).
        2. Do NOT diagnose the student or use clinical language (e.g., do not say "You have anxiety").
        3. Acknowledge their specific struggles gently, but heavily emphasize their STRENGTHS, resilience, and positive moments.
        4. Make them feel seen, validated, and proud of themselves.
        5. Sign off with "Love,\\nPawPal 🐾"
        
        Example format:
        Dear Friend,
        [Letter content]
        
        Love,
        PawPal 🐾
        """
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.1-8b-instant",
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Gemini Letter Generation Error: {e}")
        return "Dear Friend,\n\nI've been thinking about you this week. No matter what challenges come your way, remember that I'm always here cheering you on. I'm so proud of you.\n\nLove,\nPawPal 🐾"
