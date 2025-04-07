import cv2
import numpy as np
import os
import uuid
import base64

# Convert hex color to BGR (for target color matching)
target_color_hex = "#b6cec9"
target_color_bgr = tuple(int(target_color_hex[i:i+2], 16) for i in (1, 3, 5))[::-1]

UPLOAD_FOLDER = 'uploads/win_severity_img'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def remove_background(image, bg_color_bgr=(0, 0, 0), threshold=50):
    """
    Remove the background by replacing pixels close to the bg_color with black.
    :param image: Input image
    :param bg_color_bgr: BGR color of the background to remove
    :param threshold: Threshold for color similarity (0-255)
    :return: Image with the background removed and replaced by black
    """
    # Create a background image of the same size as the input image
    bg_image = np.full_like(image, bg_color_bgr, dtype=np.uint8)

    # Calculate the absolute difference between the image and the background color image
    diff = cv2.absdiff(image, bg_image)
    
    # Convert the difference to grayscale to get the intensity of differences
    diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
    
    # Threshold the difference to detect background pixels
    _, mask = cv2.threshold(diff_gray, threshold, 255, cv2.THRESH_BINARY_INV)
    
    # Replace the background with black using the mask
    result = cv2.bitwise_and(image, image, mask=mask)
    
    return result


def detect_color_and_blacken(image_path, target_color=target_color_bgr, threshold=40):
    # Read the image
    img = cv2.imread(image_path)
    if img is None:
        print(f"Unable to load {image_path}")
        return {"res":"unable to load"}
    
    # Resize both the original image and the processed image to 256x256
    img_resized = cv2.resize(img, (256, 256))

    # Remove the background and replace it with black
    processed_img = remove_background(img_resized, bg_color_bgr=(255, 255, 255), threshold=50)
    
    # Convert image to the LAB color space for better color detection
    lab_img = cv2.cvtColor(processed_img, cv2.COLOR_BGR2LAB)
    target_color_lab = cv2.cvtColor(np.uint8([[list(target_color)]]), cv2.COLOR_BGR2LAB)[0][0]
    
    # Calculate lower and upper bounds for color detection
    lower_bound = np.array([max(0, target_color_lab[0] - threshold),
                            max(0, target_color_lab[1] - threshold),
                            max(0, target_color_lab[2] - threshold)])
    upper_bound = np.array([min(255, target_color_lab[0] + threshold),
                            min(255, target_color_lab[1] + threshold),
                            min(255, target_color_lab[2] + threshold)])
    
    # Create a mask for the target color
    mask = cv2.inRange(lab_img, lower_bound, upper_bound)
    
    # Calculate percentage of the target color in the image
    total_pixels = mask.size
    target_pixels = cv2.countNonZero(mask)
    percentage = (target_pixels / total_pixels) * 100
    
    # Print percentage in the terminal
    print(f"Image: {image_path} - Target Color Percentage: {percentage:.2f}%")
    
    # Apply the mask to keep only the target color
    result = cv2.bitwise_and(processed_img, processed_img, mask=mask)

    # Generate unique ID for filenames
    unique_id = str(uuid.uuid4().hex)[:8]

    # Save the original resized image with a new name
    original_filename = os.path.join(UPLOAD_FOLDER, f"win_{unique_id}.jpg")
    cv2.imwrite(original_filename, img_resized)

    # Save the mask as a PNG file
    mask_filename = os.path.join(UPLOAD_FOLDER, f"win_{unique_id}.png")
    cv2.imwrite(mask_filename, mask)

    print(f"Original Image saved as: {original_filename}")
    print(f"Mask saved as: {mask_filename}")
    _,mk = overlay_mask_on_image(original_filename,mask_filename)

    return ({"severity":percentage,"mask":mk})


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

#     # Convert grayscale mask to 3-channel if needed
#     if len(mask_resized.shape) == 2:  # Grayscale image
#         mask_resized = cv2.cvtColor(mask_resized, cv2.COLOR_GRAY2BGR)

#     # Overlay the mask onto the original image
#     try:
#         overlay = cv2.addWeighted(original_image, 0.7, mask_resized, 0.3, 0)
#     except cv2.error as e:
#         raise ValueError(f"Error blending images: {e}")

#     # Save the output image
#     output_image_path = os.path.join(UPLOAD_FOLDER, f"overlay_{os.path.basename(original_image_path)}")
#     cv2.imwrite(output_image_path, overlay)

#     # Convert to Base64
#     _, buffer = cv2.imencode('.png', overlay)
#     base64_img = base64.b64encode(buffer).decode('utf-8')

#     return output_image_path, base64_img



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

    # Convert the original image to grayscale
    grayscale_image = cv2.cvtColor(original_image, cv2.COLOR_BGR2GRAY)

    # Convert the grayscale image to 3-channel BGR to match the mask
    grayscale_image_bgr = cv2.cvtColor(grayscale_image, cv2.COLOR_GRAY2BGR)

    # Convert grayscale mask to 3-channel if needed
    if len(mask_resized.shape) == 2:  # Grayscale image
        mask_resized = cv2.cvtColor(mask_resized, cv2.COLOR_GRAY2BGR)

    # Overlay the mask onto the grayscale original image
    try:
        overlay = cv2.addWeighted(grayscale_image_bgr, 0, mask_resized, 1.0, 0)  # Adjust weights here
    except cv2.error as e:
        raise ValueError(f"Error blending images: {e}")

    # Save the output image
    output_image_path = os.path.join(UPLOAD_FOLDER, f"overlay_{os.path.basename(original_image_path)}")
    cv2.imwrite(output_image_path, overlay)

    # Convert to Base64
    _, buffer = cv2.imencode('.png', overlay)
    base64_img = base64.b64encode(buffer).decode('utf-8')

    return output_image_path, base64_img
