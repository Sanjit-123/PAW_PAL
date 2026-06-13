import os
import json
from textblob import TextBlob
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

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

def generate_bot_response(user_text: str, analysis: dict) -> dict:
    try:
        model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        
        prompt = f"""
You are PawPal, an empathetic, comforting, and non-judgmental digital pet dog supporting a college student.
The user's inferred current emotional state: {analysis['sentiment']}
The user's inferred stress level: {analysis['stress_level']}

The user says: "{user_text}"

You must respond with valid JSON matching this schema:
{{
  "text": "Your supportive, gentle response (1 to 3 short sentences)",
  "action": "One of: tail_wag, head_tilt, ears_down, excited_jump",
  "expression": "One of: happy, sad, curious, sleepy, normal"
}}

Choose the action and expression that best fits the emotional tone of your reply.
        """
        
        response = model.generate_content(prompt)
        data = json.loads(response.text)
        return data
    except Exception as e:
        print(f"Gemini API Error: {e}")
        # Fallback to simple rule-engine if API fails
        return {
            "text": "I'm always here to listen, friend. Tell me more about what's on your mind. 🐾",
            "action": "tail_wag",
            "expression": "normal"
        }
