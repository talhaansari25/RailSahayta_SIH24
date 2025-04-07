import pickle

# Load model, vectorizer, and label encoder
with open('models/text_catg/complaint_category_model.pkl', 'rb') as model_file:
    model = pickle.load(model_file)

with open('models/text_catg/tfidf_vectorizer.pkl', 'rb') as tfidf_file:
    tfidf = pickle.load(tfidf_file)

with open('models/text_catg/label_encoder.pkl', 'rb') as le_file:
    label_encoder = pickle.load(le_file)


def predict_category(new_complaint):
    """
    Predict the category for a new complaint.

    Args:
        new_complaint (str): The text of the complaint.
    
    Returns:
        str: The predicted category.
    """
    processed_text = new_complaint  # Add any additional preprocessing here if needed
    tfidf_features = tfidf.transform([processed_text])
    prediction = model.predict(tfidf_features)
    category = label_encoder.inverse_transform(prediction)
    return category[0]
