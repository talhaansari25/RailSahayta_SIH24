import numpy as np
import tensorflow as tf
from io import BytesIO
from PIL import Image
import os
import uuid
from keras.layers import TFSMLayer
import cv2

# Load the trained model
model = TFSMLayer("models/violence/unet_segmentation_saved_model", call_endpoint="serving_default")

# Ensure the upload directory exists
UPLOAD_DIR = 'uploads/violence_severity'
os.makedirs(UPLOAD_DIR, exist_ok=True)

def preprocess_image(image_data, image_size=(128, 128)):
    image = Image.open(BytesIO(image_data)).convert('RGB')  # Load image from bytes
    original_image = image.copy()  # Keep a copy of the original image
    image = image.resize(image_size)  # Resize image
    image = np.array(image) / 255.0  # Normalize to [0, 1]
    return np.expand_dims(image, axis=0), original_image  # Add batch dimension

def process_mask(mask):
    mask = (mask > 0.5).astype(np.uint8)  # Threshold the mask
    return mask.squeeze()  # Remove the batch dimension

def calculate_severity(mask):
    total_pixels = mask.size
    white_pixels = np.sum(mask)  # Count white pixels
    severity_percentage = (white_pixels / total_pixels) * 100
    return severity_percentage


def overlay_mask(image, mask, opacity=0.7, mask_color=(0, 0, 255)):
    """
    Overlays a binary mask onto the image with a specified color and opacity.
    The mask color is set to deep red by default (BGR: (0, 0, 255)).
    """
    # Convert image to NumPy array if it's not already
    if isinstance(image, Image.Image):  # Check if it's a PIL Image
        image = np.array(image)

    # Ensure the mask is a binary mask (0 or 255)
    mask = (mask > 0.5).astype(np.uint8) * 255

    # If the image is grayscale, convert it to RGB
    if len(image.shape) == 2 or image.shape[-1] == 1:  # Grayscale
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)

    # Ensure the mask has the same shape as the image
    if mask.shape[:2] != image.shape[:2]:
        mask = cv2.resize(mask, (image.shape[1], image.shape[0]))

    # Create a colored mask (deep red, BGR format)
    colored_mask = np.zeros_like(image)
    colored_mask[:, :] = mask_color  # Apply deep red color (BGR format)

    # Apply the binary mask to the colored mask
    colored_mask = cv2.bitwise_and(colored_mask, colored_mask, mask=mask)

    # Apply the overlay using addWeighted with specified opacity
    overlayed_image = cv2.addWeighted(image, 1 - opacity, colored_mask, opacity, 0)

    return overlayed_image

def predict_image(image_data):
    """
    Predict severity and overlay mask on image.
    """
    # Generate a unique identifier for the images
    unique_id = str(uuid.uuid4())

    # Preprocess the image
    input_image, original_image = preprocess_image(image_data)

    # Predict the mask
    predictions = model(input_image)  # Predict mask using TFSMLayer

    # Print the keys of the model output to debug
    print("Model predictions keys:", predictions.keys())

    # Automatically find the key for the predicted mask
    predicted_mask = None
    for key in predictions.keys():
        if 'conv' in key or 'output' in key:  # Look for common mask output keys
            predicted_mask = predictions[key]
            print(f"Using key: {key}")
            break

    # Check if a key was found for the mask
    if predicted_mask is None:
        raise ValueError("No valid key found for the predicted mask.")

    # Process the mask
    processed_mask = process_mask(predicted_mask.numpy())

    # Calculate severity
    severity = calculate_severity(processed_mask)

    # Overlay mask on the original image
    overlayed_image = overlay_mask(original_image, processed_mask)

    return severity, overlayed_image
