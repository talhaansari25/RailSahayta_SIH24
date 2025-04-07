




from flask import Flask, request, jsonify
from tensorflow.keras.preprocessing import image
import numpy as np
import tensorflow as tf
from keras.layers import TFSMLayer
import io
from PIL import Image
from flask_cors import CORS

# Load the TensorFlow SavedModel
model = TFSMLayer('savedmodelsubcat', call_endpoint="serving_default") # Replace with your SavedModel path

CLASS_NAMES_1 = ["basin", "dirty_basin"]

CLASS_NAMES_2 = ["crowded", "lesscrowded"]


# Define image preprocessing function
def preprocess_image(img_bytes):
    img = Image.open(io.BytesIO(img_bytes))
    img = img.resize((224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0
    return img_array

# Flask app setup
app = Flask(__name__)

CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://192.168.84.79:800", "http://172.16.9.139:56949", "http://192.168.18.23:56949", "*"],  # Allowed origins
        "methods": ["GET", "POST", "OPTIONS"],  # Allowed HTTP methods
        "allow_headers": ["Content-Type", "Authorization"],  # Allowed headers
    }
})

# API endpoint for image classification
@app.route('/classify', methods=['POST'])
def classify_image():
    # Get image data from request
    if 'image' not in request.files:
        return jsonify({'error': 'No image file found in request'}), 400

    image_file = request.files['image']
    img_bytes = image_file.read()

    # Preprocess image
    img_array = preprocess_image(img_bytes)

    # Make prediction
    predictions = model(img_array)
    if isinstance(predictions, dict):
        # Assuming single output key for classification
        key = list(predictions.keys())[0]
        output = predictions[key].numpy()
    else:
        output = predictions.numpy()
    output = np.array(output)

    # Check if predictions is a dictionary or NumPy array
    if isinstance(predictions, np.ndarray):
        # Handle NumPy array (use argmax if needed)
        if len(predictions.shape) == 1:
            predicted_class = predictions[0]  # Assuming single class value
        else:
            predicted_class = np.argmax(predictions, axis=1)  # Use argmax for multi-dimensional arrays
    else:
        # Handle dictionary output (extract relevant data)
        predicted_class = np.argmax(predictions[key])  # Assuming 'key' holds class probabilities

    predicted_class_name = CLASS_NAMES_1[predicted_class]


    # Return prediction result
    return jsonify({'class': predicted_class_name, 'confidence':  float(np.max(output))})


# API endpoint for image classification
@app.route('/crowd', methods=['POST'])
def classify_image2():
    # Get image data from request
    if 'image' not in request.files:
        return jsonify({'error': 'No image file found in request'}), 400

    image_file = request.files['image']
    img_bytes = image_file.read()

    # Preprocess image
    img_array = preprocess_image(img_bytes)

    # Make prediction
    predictions = model(img_array)
    if isinstance(predictions, dict):
        # Assuming single output key for classification
        key = list(predictions.keys())[0]
        output = predictions[key].numpy()
    else:
        output = predictions.numpy()
    output = np.array(output)

    # Check if predictions is a dictionary or NumPy array
    if isinstance(predictions, np.ndarray):
        # Handle NumPy array (use argmax if needed)
        if len(predictions.shape) == 1:
            predicted_class = predictions[0]  # Assuming single class value
        else:
            predicted_class = np.argmax(predictions, axis=1)  # Use argmax for multi-dimensional arrays
    else:
        # Handle dictionary output (extract relevant data)
        predicted_class = np.argmax(predictions[key])  # Assuming 'key' holds class probabilities

    predicted_class_name = CLASS_NAMES_2[predicted_class]


    # Return prediction result
    return jsonify({'class': predicted_class_name, 'confidence':  float(np.max(output))})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)  # Run the Flask app



