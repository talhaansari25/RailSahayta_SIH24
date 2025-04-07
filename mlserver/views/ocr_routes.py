from flask import Blueprint, request, jsonify
import os
import controllers.ocr_ctr as ocr_ctr

api_routes_ocr = Blueprint("api_routes_ocr", __name__)

@api_routes_ocr.route("/ocr_extraction", methods=["POST"])
def ocr_extractions():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    
    try:
        # Preprocess the image from the in-memory file
        image = ocr_ctr.preprocess_image_from_memory(file.read())
        
        # Perform OCR on the preprocessed image
        detected_text = ocr_ctr.perform_ocr_from_image(image)
        
        # Extract information
        extracted_info = ocr_ctr.extract_info(detected_text)
        
        # Return extracted information
        return jsonify({
            "Detected Text": detected_text,
            "Extracted Information": extracted_info
        }),200
    except Exception as e:
        return jsonify({"error": str(e)}), 500