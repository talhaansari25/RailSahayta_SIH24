from sentence_transformers import SentenceTransformer
import torch

# Check for GPU availability and use it
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

# Load the sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2', device=device)

# Define categories and their subcategories
category_subcategories = {
    "seat": ["broken seat", "scratched seat", "dirty seat", "bedroll"],
    "window": ["cracked window", "dirty window", "broken window"],
    "food": ["spoilt/expired food", "food taste", "food quantity", "highly charged"],
    "compartment": ["garbage inside coach", "electricity not available", "door malfunctioning", "dirty door"],
    "toilet": ["unhygenic toilet", "unhygenic washbasin", "flush problem", "no water"],
    "violence": ["staff violence/behaviour", "passenger violence", "bribery", "seat hijacking", "smoking/alcohol"],
    "management": ["broken equipments", "train delay", "app issue", "missing items", "unhygenic equipments", "bribery"],
    "ticketing issue": ["wrong ticket", "money issue"],
    "security": ["robbery", "misbehaviour with lady passenger", "unauthorized person in ladies coach", "absence of security personnel"],
    "electricity": ["AC (Air Conditioner)", "Light", "Fan", "Charging Port", "Escalator Malfunction",
    "Indicator Malfunction"],
    "medical": ["First Aid Kit Requirement", "Medical Assistance"]
}

# Precompute embeddings for all subcategories
category_embeddings = {
    category: model.encode(subcategories, convert_to_tensor=True, device=device)
    for category, subcategories in category_subcategories.items()
}

# Predict function
def predict_subcategory(description, category):
    if category not in category_subcategories:
        return "Category not recognized"
    
    # Retrieve precomputed embeddings for the relevant category
    relevant_embeddings = category_embeddings[category]
    
    # Encode the description
    desc_embedding = model.encode(description, convert_to_tensor=True, device=device)
    
    # Compute cosine similarity using PyTorch for faster computation
    similarities = torch.nn.functional.cosine_similarity(desc_embedding, relevant_embeddings)
    
    # Find the best match
    best_match_idx = torch.argmax(similarities).item()
    predicted_subcategory = category_subcategories[category][best_match_idx]
    return predicted_subcategory

# # Example usage
# desc = "AC & Light is not working properly and very slow in compartment no A16"
# category = "Electricity"
# subcategory = predict_subcategory(desc, category)
# print(f"Predicted Subcategory: {subcategory}")
