from textblob import TextBlob

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
