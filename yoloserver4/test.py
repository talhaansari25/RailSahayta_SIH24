import torch
from pathlib import Path
import cv2

# Load the YOLOv5 model
model_path = 'models/best.pt'  # Replace with your model path
model = torch.hub.load('ultralytics/yolov5', 'custom', path=model_path, force_reload=True)


# Directory to save output images
output_dir = 'outputs'  # Replace with your output directory
Path(output_dir).mkdir(parents=True, exist_ok=True)  # Ensure the directory exists




# Input image path (one image at a time)
image_path = "image.jpg"  # Replace with the actual path of the image
image_count = len(list(Path(output_dir).glob("*.jpg"))) + 1  # Count existing images in output directory

# Perform inference
print(f"Processing {image_path}...")

results = model(str(image_path))  # Use file path directly

# Extract the image with predictions
predicted_image = results.render()[0]  # Rendered image as a numpy array

# Save the image with a new name in the same folder
output_image_path = Path(output_dir) / f"image_{image_count}.jpg"
cv2.imwrite(str(output_image_path), predicted_image)  # Save using OpenCV

print(f"Saved output to {output_image_path}")
print("Processing completed.")
