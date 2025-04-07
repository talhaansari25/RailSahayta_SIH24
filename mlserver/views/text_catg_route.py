from flask import Blueprint, request, jsonify

import controllers.text_catg_ctr as text_catg_ctr
import controllers.text_subcatg_ctr as text_subcatg_ctr

api_routes_text_catg = Blueprint("api_routes_text_catg", __name__)

@api_routes_text_catg.route("/text_category2", methods=["POST"])
def text_category():
    try:
        data = request.json
        if not data or 'complaint' not in data:
            return jsonify({"error": "Complaint text is required"}), 400
        
        complaint = data['complaint']
        category = text_catg_ctr.predict_category(complaint)
        return jsonify({"category": category}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@api_routes_text_catg.route("/text_subcategory", methods = ["POST"])
def text_subcategory():
    '''
    Request Body:
    {
        "description": "Issue description",
        "category": "Main category"
    }
    '''
    data = request.get_json()
    if not data or "description" not in data or "category" not in data:
        return jsonify({"error": "Invalid request. Please provide 'description' and 'category'."}), 400

    description = data["description"]
    category = data["category"]
    
    # Call the prediction function
    predicted_subcategory = text_subcatg_ctr.predict_subcategory(description, category)
    return jsonify({"subcategory": predicted_subcategory})















import spacy
from collections import defaultdict

# Load spaCy's language model
nlp = spacy.load("en_core_web_sm")

# Define the mapping of keywords to categories and subcategories
category_mapping = {
    "Staff Behaviour": ["Misbehaviour", "Harassment", "Extortion"],
    "Security": ["Unauthorized person", "Eve-teasing", "Quarrelling", "Hooliganism", "Dacoity", "Robbery"],
    "Medical Assistance": ["Medical", "Assistance", "Passenger fallen down"],
    "Electrical Equipment": ["Fans", "Lights", "Charging Points", "Air Conditioner"],
    "Coach - Cleanliness": ["Cockroach", "Rodents", "Service Quality", "Hygiene"],
    "Coach - Maintenance": ["Window", "Door", "Toilet", "Broken", "Tap leaking"],
    "Luggage / Parcels": ["Luggage", "Parcel", "Left Behind", "Unclaimed", "Suspected Articles"],
    "Reserved Ticketing": ["E-Ticketing", "Counter Ticket", "Tatkal"],
    "Unreserved Ticketing": ["UTS", "ATVM", "Digital Payment", "MST"],
    "Punctuality": ["Late Running"],
    "Divyangjan Facilities": ["Wheel Chair", "Battery operated car", "Divyangjan toilet", "Low height ticket counter"],
    "Miscellaneous": ["Others", "Miscellaneous"],
    "Refund of Tickets": ["Refund"],
    "Water Availability": ["Drinking Water", "Tap", "Water Vending Machines"],
    "Passenger Amenities": ["Seating", "Benches", "Wi-Fi", "Parking", "Waiting Room", "Retiring Room"],
    "Bed Roll": ["E-Bed Roll", "Bed Roll"],
    "Catering & Vending Services": ["Food", "Catering", "Rail Neer", "Packaged Drinking Water"],
    "Cleanliness": ["Dirty", "Cleanliness", "Cockroach", "Hygiene"],
    "Goods": ["Freight", "Demurrage", "Wharfage"],
    "Corruption / Bribery": ["Corruption", "Bribery", "Overcharging"],
    "Facilities for Women with Special needs": ["Segregated area", "Lactating mothers", "Low seat toilet"]
}

def detect_category_subcategory(complaint_text):
    # Process the complaint text using spaCy
    doc = nlp(complaint_text.lower())

    # Initialize detected categories and subcategories
    detected = defaultdict(list)

    # Iterate over tokens and match with keywords
    for token in doc:
        for category, subcategories in category_mapping.items():
            for subcategory in subcategories:
                if subcategory.lower() in token.text:
                    detected[category].append(subcategory)

    # Format the output for detected categories and subcategories
    result = {}
    for category, subcategories in detected.items():
        result[category] = list(set(subcategories))

    return result

@api_routes_text_catg.route("/text_category", methods=["POST"])
def text_category_final():
    # # Test the function
    # complaint_text = "The air conditioner is not working, and the coach is very dirty. Additionally, there is no drinking water available on the platform."
    # result = detect_category_subcategory(complaint_text)
    # print("Detected Categories and Subcategories:", result)
    try:
        data = request.json
        if not data or 'complaint' not in data:
            return jsonify({"error": "Complaint text is required"}), 400
        
        complaint = data['complaint']
        category = detect_category_subcategory(complaint)
        return jsonify({"category": category}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500