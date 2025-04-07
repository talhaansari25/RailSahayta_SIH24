from flask import Flask, request, jsonify
from pathlib import Path
import torch
import cv2
import base64
import numpy as np
import os
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)

CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://192.168.84.79:800", "http://172.16.9.139:56949", "http://192.168.18.23:56949", "*"],  # Allowed origins
        "methods": ["GET", "POST", "OPTIONS"],  # Allowed HTTP methods
        "allow_headers": ["Content-Type", "Authorization"],  # Allowed headers
    }
})

# Ensure the outputs directory exists
output_dir = Path("outputs")
output_dir.mkdir(exist_ok=True)

# Load the YOLOv5 model
model_path = 'models/best2.pt'  # Replace with your model path
model = torch.hub.load('ultralytics/yolov5', 'custom', path=model_path, force_reload=True)

# Function to convert an image (numpy array) to a base64 string
def image_to_base64(image):
    _, buffer = cv2.imencode('.jpg', image)
    base64_image = base64.b64encode(buffer).decode('utf-8')
    return base64_image

@app.route('/predictimage', methods=['POST'])
def predict():
    # Ensure an image file is provided in the request
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    # Read the image from the request
    file = request.files['image']
    image_bytes = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)

    # Perform inference
    results = model(image)

    # Extract predictions
    predictions = results.pandas().xyxy[0]  # Pandas DataFrame with predictions
    labels = predictions['name'].tolist()  # Extract class names

    # Render the image with predictions
    rendered_image = results.render()[0]  # Rendered image as a numpy array

    # Save the rendered image locally
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = output_dir / f"output_{timestamp}.jpg"
    cv2.imwrite(str(output_path), rendered_image)

    # Convert the rendered image to base64
    base64_image = image_to_base64(rendered_image)

    # Return the image URL, base64 string, and labels as JSON
    response = {
        "aimage_url": f"file:///{output_path.resolve()}",
        "image_base64": base64_image,
        "blabels": labels if len(labels) > 0 else "compartment"
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9999, debug=True)
