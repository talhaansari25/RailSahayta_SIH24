from flask import Blueprint, request, jsonify
import controllers.violence_ctr as violence_ctr

api_routes_violence = Blueprint("api_routes_violence", __name__)

# @api_routes_violence.route("/violence_severity", methods=["POST"])
# def violence_severity():
#     if 'image' not in request.files:
#         return jsonify({'error': 'No image file provided'}), 400

#     try:
#         image_file = request.files['image']
#         image_data = image_file.read()

#         # Predict severity and save images
#         severity = violence_ctr.predict_severity(image_data)

#         return jsonify({'severity': severity,}), 200
    
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
    

import base64
import cv2

@api_routes_violence.route("/violence_severity", methods=["POST"])
def violence_severity():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    try:
        # Read the uploaded image file
        image_file = request.files['image']
        image_data = image_file.read()

        # Predict severity and get overlayed image
        severity, overlayed_image = violence_ctr.predict_image(image_data)

        # Encode the overlayed image to Base64
        _, buffer = cv2.imencode('.png', overlayed_image)
        img_base64 = base64.b64encode(buffer).decode('utf-8')

        # Return JSON response with severity and the image in Base64 format
        return jsonify({
            'severity': severity,
            'overlayed_image': img_base64
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



