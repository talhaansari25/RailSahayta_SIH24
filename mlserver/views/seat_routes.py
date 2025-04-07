from flask import Blueprint, request, jsonify, send_file
import os
import base64
from io import BytesIO
import controllers.seat_test128 as seat_test128
from PIL import Image
import io

import cv2

api_routes_seat = Blueprint("api_routes_seat", __name__)


@api_routes_seat.route("/seat_priority", methods=["POST"])
def seat_priority():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    # Save the uploaded file
    image_file = request.files['image']

    image_data = image_file.read()

    try:
        # Call the prediction function
        rank, overlayed_image = seat_test128.predict_image(image_data)

       # Convert the image to base64 for returning it as a response
        _, buffer = cv2.imencode('.png', overlayed_image)
        img_base64 = base64.b64encode(buffer).decode('utf-8')


        response = {
            "severity": rank,
            "overlayed_image": img_base64  # Send as base64 string
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
