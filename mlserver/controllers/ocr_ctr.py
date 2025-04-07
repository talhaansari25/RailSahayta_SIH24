from paddleocr import PaddleOCR
from PIL import Image
import io
import re

# Regular expressions for Train No, PNR No, and any 8-digit number
train_no_regex = r'\b\d{4,5}\b'  # Matches any 4-5 digit number
pnr_no_regex = r'\b\d{3}-\d{7}\b'  # Matches PNR format like XXX-XXXXXXX
eight_digit_number_regex = r'\b\d{8}\b'  # Matches any 8-digit number

def preprocess_image_from_memory(file):
    """
    Downscale the image and convert it to RGB format from an in-memory file.
    """
    try:
        image = Image.open(io.BytesIO(file))
        image = image.resize((image.width // 2, image.height // 2))  # Reducing size by half
        image = image.convert('RGB')  # Convert to RGB to avoid RGBA issues
        return image
    except Exception as e:
        raise ValueError(f"Image preprocessing failed: {e}")
    
ocr = PaddleOCR(use_gpu=True, lang='en')  # Disable GPU and set language to English

def perform_ocr_from_image(image):
    """
    Perform OCR on the given PIL image using PaddleOCR without saving to disk.
    """

    try:
        # Convert the PIL image to raw bytes
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG")
        buffer.seek(0)
        image_bytes = buffer.read()  # Get raw bytes of the image

        # Perform OCR directly on the image bytes
        results = ocr.ocr(image_bytes, cls=False)  # cls=False to skip text classification
        all_text = [line[1][0] for line in results[0]]
        return " ".join(all_text)  # Combine all text into one paragraph
    except Exception as e:
        raise ValueError(f"OCR failed: {e}")


def extract_info(text):
    """
    Extract required information like Train Number, PNR Number, and Ticket Number using regex.
    """
    train_numbers = re.findall(train_no_regex, text)
    pnr_numbers = re.findall(pnr_no_regex, text)
    eight_digit_numbers = re.findall(eight_digit_number_regex, text)

    return {
        "trainNo": train_numbers[0] if train_numbers else "Not Found",
        "pnrNo": pnr_numbers[0] if pnr_numbers else "Not Found",
        "ticketNo": eight_digit_numbers[0] if eight_digit_numbers else "Not Found"
    }
