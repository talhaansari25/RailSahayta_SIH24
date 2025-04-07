from flask import Blueprint, request, jsonify
from controllers.comp_ctr import DetectionController

import base64
import io
from PIL import Image, ImageDraw, ImageFont

MODEL_PATH = "models/mask_rcnn/mask_rcnn_model.pth"
NUM_CLASSES = 61  # 1 background + 60 categories
controller = DetectionController(MODEL_PATH, NUM_CLASSES)

api_routes_comp = Blueprint("api_routes_comp", __name__)


def annotate_image(image, predictions):
    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default()

    for prediction in predictions:
        box = prediction["box"]
        label = prediction["label"]
        score = prediction["score"]

        # Convert box to integers for drawing
        box = [int(coord) for coord in box]
        draw.rectangle(box, outline="red", width=3)
        text = f"{label} ({score:.2f})"

        # # Get the text size using font.getbbox
        # text_size = draw.textsize(text, font=font)
        # text_background = [box[0], box[1] - text_size[1], box[0] + text_size[0], box[1]]

        # # Draw text background
        # draw.rectangle(text_background, fill="red")
        # draw.text((box[0], box[1] - text_size[1]), text, fill="white", font=font)

    return image




@api_routes_comp.route("/comp_severity", methods=["POST"])
def comp_severity():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        # Read image from request
        file = request.files["image"]
        image_bytes = file.read()

        # Preprocess image
        original_image, image_tensor = controller.preprocess_image(image_bytes)

        # Get predictions
        boxes, labels, scores = controller.predict(image_tensor)

        threshold = 0.1
        filtered_predictions = [
            {"box": box, "label": label, "score": score}
            for box, label, score in zip(boxes, labels, scores) if score > threshold
        ]
        # print(filtered_predictions[0])
        # Annotate the original image
        annotated_image = annotate_image(original_image, filtered_predictions)

        # Convert annotated image to Base64
        buffered = io.BytesIO()
        annotated_image.save(buffered, format="PNG")
        base64_image = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return jsonify({"image": base64_image, "predictions": filtered_predictions}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500