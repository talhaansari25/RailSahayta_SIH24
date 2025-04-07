# from flask import Blueprint, request, jsonify
# import os
# from controllers.win_ctr import detect_color_and_blacken

# import cv2
# import base64

# api_routes_win = Blueprint("api_routes_win", __name__)

# UPLOAD_FOLDER = 'uploads' 
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# def overlay_mask_on_image(original_image_path, mask_image_path):
#     # Check if the files exist
#     if not os.path.exists(original_image_path):
#         raise ValueError(f"File not found: {original_image_path}")
#     if not os.path.exists(mask_image_path):
#         raise ValueError(f"File not found: {mask_image_path}")

#     # Read the original and mask images
#     original_image = cv2.imread(original_image_path)
#     mask_image = cv2.imread(mask_image_path, cv2.IMREAD_UNCHANGED)

#     if original_image is None or mask_image is None:
#         raise ValueError("Failed to read one of the image files. Ensure they are valid image formats.")

#     # Ensure the mask image has the same dimensions as the original image
#     mask_resized = cv2.resize(mask_image, (original_image.shape[1], original_image.shape[0]))

#     # Overlay the mask onto the original image
#     overlay = cv2.addWeighted(original_image, 0.7, mask_resized, 0.3, 0)

#     # Save the output image
#     output_image_path = os.path.join(UPLOAD_FOLDER, f"overlay_{os.path.basename(original_image_path)}")
#     cv2.imwrite(output_image_path, overlay)

#     # Convert to Base64
#     _, buffer = cv2.imencode('.png', overlay)
#     base64_img = base64.b64encode(buffer).decode('utf-8')

#     return output_image_path, base64_img

# @api_routes_win.route("/win_priority", methods=["POST"])
# def win_priority():
#     # Check if the image file is in the request
#     if 'image' not in request.files:
#         return jsonify({"error": "No image file provided"}), 400
    
#     image_file = request.files['image']
#     image_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
#     image_file.save(image_path)

#     try:
#         # Validate file extension
#         if not image_file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp')):
#             raise ValueError("Unsupported file format. Please upload a valid image.")

#         # Call the function to detect the target color and blacken background
#         severityScore, mask_image_path = detect_color_and_blacken(image_path)  # Assume this function returns severity and path to the mask image

#         # Overlay the mask on the original image
#         output_image_path, base64_img = overlay_mask_on_image(image_path, mask_image_path)

#         # Respond with success
#         return jsonify({
#             "message": "Image processed successfully",
#             "status": severityScore,
#             # "output_image": base64_img
#         }), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


from flask import Blueprint, request, jsonify
import os
from controllers.win_ctr import detect_color_and_blacken

import cv2
import base64

api_routes_win = Blueprint("api_routes_win", __name__)
UPLOAD_FOLDER = 'uploads' 
os.makedirs(UPLOAD_FOLDER, exist_ok=True)




def overlay_mask_on_image(original_image_path, mask_image_path):
    # Check if the files exist
    if not os.path.exists(original_image_path):
        raise ValueError(f"File not found: {original_image_path}")
    if not os.path.exists(mask_image_path):
        raise ValueError(f"File not found: {mask_image_path}")

    # Read the original and mask images
    original_image = cv2.imread(original_image_path)
    mask_image = cv2.imread(mask_image_path, cv2.IMREAD_UNCHANGED)

    if original_image is None or mask_image is None:
        raise ValueError("Failed to read one of the image files. Ensure they are valid image formats.")

    # Ensure the mask image has the same dimensions as the original image
    mask_resized = cv2.resize(mask_image, (original_image.shape[1], original_image.shape[0]))

    # Overlay the mask onto the original image
    overlay = cv2.addWeighted(original_image, 0.7, mask_resized, 0.3, 0)

    # Save the output image
    output_image_path = os.path.join(UPLOAD_FOLDER, f"overlay_{os.path.basename(original_image_path)}")
    cv2.imwrite(output_image_path, overlay)

    # Convert to Base64
    _, buffer = cv2.imencode('.png', overlay)
    base64_img = base64.b64encode(buffer).decode('utf-8')

    return output_image_path, base64_img





@api_routes_win.route("/win_priority", methods=["POST"])
def win_priority():
    # Check if the image file is in the request
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    image_file = request.files['image']
    image_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
    image_file.save(image_path)
    

    try:
        # Call the function to detect the target color and blacken background
        severityScore = detect_color_and_blacken(image_path)  # Target color as BGR (same as above)

        # Respond with success
        return jsonify({"message": "Image processed successfully", "status": severityScore, }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

