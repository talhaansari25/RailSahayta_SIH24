import os
import numpy as np
import tensorflow as tf
import cv2
from flask import Blueprint, request, jsonify
from keras.layers import TFSMLayer
from io import BytesIO
from PIL import Image

# Load the model using TFSMLayer
model = TFSMLayer('models/seat_severity/unet_saved_model', call_endpoint="serving_default")

# Constants
IMG_HEIGHT = 256
IMG_WIDTH = 256
output_folder = 'uploads'

# Function to preprocess the custom image
def preprocess_image(image, image_size=(IMG_HEIGHT, IMG_WIDTH)):
    """
    Preprocesses the image for prediction.
    - Resizes the image to the specified dimensions.
    - Normalizes pixel values to the range [0, 1].
    - Adds a batch dimension.
    """
    image = tf.image.resize(image, image_size)  # Resize the image
    image = image / 255.0  # Normalize to [0, 1]
    return np.expand_dims(image, axis=0)  # Add batch dimension

# Function to preprocess the predicted mask for display
def process_mask(mask, threshold=0.7):
    """
    Processes the predicted mask.
    - Applies a threshold to binarize the mask.
    - Removes the batch dimension for display purposes.
    """
    mask = (mask > threshold).astype(np.uint8)  # Threshold the mask
    return mask.squeeze()  # Remove the batch dimension

def overlay_mask(image, mask):
    """
    Overlays a binary mask onto the image using a dark magenta color.
    """
    # Convert image to NumPy array if it's not already
    if isinstance(image, tf.Tensor):
        image = image.numpy()

    # Ensure the mask is a binary mask (0 or 255)
    mask = (mask > 0.5).astype(np.uint8) * 255

    # If the image is grayscale, convert it to RGB
    if len(image.shape) == 2 or image.shape[-1] == 1:  # Grayscale
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)

    # Ensure the mask has the same shape as the image
    if mask.shape[:2] != image.shape[:2]:
        mask = cv2.resize(mask, (image.shape[1], image.shape[0]))

    # Convert the binary mask to a colored mask (dark magenta)
    dark_magenta_color = [139, 0, 139]  # RGB values for dark magenta
    colored_mask = np.zeros_like(image, dtype=np.uint8)
    colored_mask[mask > 0] = dark_magenta_color

    # Apply the overlay using addWeighted
    overlayed_image = cv2.addWeighted(image, 0.7, colored_mask, 0.3, 0)

    return overlayed_image


def predict_image(image_data):
    """
    Given image data, this function predicts the mask, calculates rank,
    overlays the mask, and returns the results.
    """
    # Convert byte data to an image
    image = Image.open(BytesIO(image_data))
    image = np.array(image)
    image = tf.convert_to_tensor(image, dtype=tf.float32)

    # Preprocess the image
    preprocessed_image = preprocess_image(image)

    # Predict the mask using TFSMLayer
    predictions = model(preprocessed_image)

    # Accessing the predicted mask (we know it's under 'conv2d_29')
    predicted_mask = predictions['conv2d_29']

    # Convert the tensor to a NumPy array
    predicted_mask_np = predicted_mask.numpy()

    # Process the predicted mask (assuming binary classification for simplicity)
    display_mask = process_mask(predicted_mask_np)

    # Calculate the percentage of white area
    total_pixels = display_mask.size
    white_pixels = np.sum(display_mask)
    white_area_percentage = (white_pixels / total_pixels) * 100

    # Determine rank based on white area percentage
    if white_area_percentage >= 50:
        rank = 10
    elif 40 <= white_area_percentage < 50:
        rank = 8
    elif 30 <= white_area_percentage < 40:
        rank = 6
    elif 20 <= white_area_percentage < 30:
        rank = 4
    elif 10 <= white_area_percentage < 20:
        rank = 2
    else:  # 0-10%
        rank = 1

    # Overlay mask on the original image
    original_image = tf.squeeze(preprocessed_image, axis=0).numpy()  # Remove batch dimension
    original_image = (original_image * 255).astype(np.uint8)  # Scale back to [0, 255]
    overlayed_image = overlay_mask(original_image, display_mask)

    return rank, overlayed_image
