
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib

# Load NLP model and pre-trained models
nlp = spacy.load("en_core_web_sm")
sentiment_model = joblib.load("models/sentiment/sentiment_model.pkl")
vectorizer = joblib.load("models/sentiment/tfidf_vectorizer.pkl")

# Step 1: Preprocess the feedback data
def preprocess_feedback(feedback_text):
    feedback_text = feedback_text.lower()
    return feedback_text

# Step 2: Extract time and action entities
def extract_time_and_action_entities(text):
    doc = nlp(text)
    entities = []
    for ent in doc.ents:
        if ent.label_ == "TIME":
            entities.append(ent.text)
        if ent.label_ == "EVENT":
            entities.append(ent.text)
    return entities

# Step 3: Extract central idea using TF-IDF
def extract_central_idea(text):
    if not text.strip():
        return "No central idea"
    vectorizer = TfidfVectorizer(max_features=10, stop_words='english')
    try:
        tfidf_matrix = vectorizer.fit_transform([text])
        if tfidf_matrix.shape[1] == 0:
            return "No central idea"
        feature_names = vectorizer.get_feature_names_out()
        feature_scores = tfidf_matrix.sum(axis=0).A1
        sorted_indices = feature_scores.argsort()[-3:][::-1]
        top_keywords = [feature_names[i] for i in sorted_indices]
        return " ".join(top_keywords)
    except ValueError:
        return "No central idea"

# Step 4: Predict sentiment
def predict_sentiment(feedback):
    processed_feedback = preprocess_feedback(feedback)
    vectorized_feedback = vectorizer.transform([processed_feedback])
    sentiment_probabilities = sentiment_model.predict_proba(vectorized_feedback)[0]
    sentiment_score = sentiment_probabilities[1]  # Positive sentiment probability
    return sentiment_score

# Step 5: Detect areas needing improvement
def detect_improvement_area(sentiment, central_idea):
    sentiment_threshold = 0.4
    if sentiment < sentiment_threshold:
        return f"Improvement needed due to negative sentiment and issue detected: {central_idea}"
    return "No improvement needed"