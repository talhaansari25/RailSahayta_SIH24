from flask import request, jsonify, send_from_directory, Blueprint
import os
import time
import json
import controllers.img_category_ctr as testapi
# # ====================== video =======================
import io
from moviepy.editor import VideoFileClip

api_routes_img_category = Blueprint("api_routes_img_category", __name__)

model = testapi.load_model() 
modelstation = testapi.load_model_station()

@api_routes_img_category.route('/predictimage', methods=['POST'])
def predict_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    
    image_file = request.files['image']
    image_data = image_file.read()

    try:
        

        predicted_class_name, conf = testapi.predict_image(model, image_data)

        response = {
            "predicted_class": predicted_class_name,
            "confidence": conf,
            # "all_confidences": predictions.tolist()
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api_routes_img_category.route('/stationimage', methods=['POST']) 
def stationimage(): 
    if 'image' not in request.files: 
        return jsonify({"error": "No image file provided"}), 400 
     
    image_file = request.files['image'] 
    image_data = image_file.read() 
 
    try:   
        predicted_class_name, conf = testapi.predict_image_station(modelstation, image_data) 
        response = { 
            "predicted_class": predicted_class_name, 
            "confidence": conf, 
            # "all_confidences": predictions.tolist() 
        } 
 
        return jsonify(response) 
 
    except Exception as e: 
        return jsonify({"error": str(e)}), 500 



@api_routes_img_category.route('/predictvideo', methods=['POST'])
def process_video():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    file_name = file.filename.lower()

    # Check the file extension
    if file_name.endswith(('.mp4', '.avi', '.mov', '.mkv')):
        # Handle Video Processing
        video_buffer = io.BytesIO(file.read())
        with open("temp_video.mp4", "wb") as temp_file:
            temp_file.write(video_buffer.getbuffer())
        video = VideoFileClip("temp_video.mp4")
        audio_path = extract_audio_from_video("temp_video.mp4")

        # Process Video Frames
        most_frequent_class,confidence = testapi.process_video_frames_sequential(video,model)
        transcription = ""
        hindi = ""

        if most_frequent_class != "violence":
            transcription,hindi = transcribe_and_translate(audio_path)


        # Analyze Audio
        # intensity, text = analyze_audio_from_video(video)
        
        # Clean up
        video.close()
        os.remove("temp_video.mp4")
        os.remove(audio_path)

        return jsonify({
            "type": "video",
            "predicted_class": most_frequent_class,
            "transcription": transcription,
            "hindi_text" : hindi,
            "confidence" : confidence
        })

    else:
        return jsonify({"error": "Unsupported file format"}), 400
    





@api_routes_img_category.route('/stationvideo', methods=['POST'])
def station_video():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    file_name = file.filename.lower()

    # Check the file extension
    if file_name.endswith(('.mp4', '.avi', '.mov', '.mkv')):
        # Handle Video Processing
        video_buffer = io.BytesIO(file.read())
        with open("temp_video.mp4", "wb") as temp_file:
            temp_file.write(video_buffer.getbuffer())
        video = VideoFileClip("temp_video.mp4")
        audio_path = extract_audio_from_video("temp_video.mp4")

        # Process Video Frames
        most_frequent_class,confidence = testapi.process_video_frames_sequential(video,modelstation,station=True)
        transcription = ""
        hindi = ""

        if most_frequent_class != "violence":
            transcription,hindi = transcribe_and_translate(audio_path)


        # Analyze Audio
        # intensity, text = analyze_audio_from_video(video)
        
        # Clean up
        video.close()
        os.remove("temp_video.mp4")
        os.remove(audio_path)

        return jsonify({
            "type": "video",
            "predicted_class": most_frequent_class,
            "transcription": transcription,
            "hindi_text" : hindi,
            "confidence" : confidence
        })

    else:
        return jsonify({"error": "Unsupported file format"}), 400
    








UPLOAD_FOLDER_IMG = '../cloud-storage'
os.makedirs(UPLOAD_FOLDER_IMG, exist_ok=True)

@api_routes_img_category.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image = request.files['image']
    if image.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if image:
        # Save the image file
        image_path = os.path.join(UPLOAD_FOLDER_IMG, image.filename)
        image.save(image_path)
        return jsonify({"image_path": f"/get_image/{image.filename}"}), 201

@api_routes_img_category.route('/get_image/<filename>', methods=['GET'])
def get_image(filename):
    try:
        return send_from_directory(UPLOAD_FOLDER_IMG, filename)
    except FileNotFoundError:
        return jsonify({"error": "Image not found"}), 404





def extract_audio_from_video(video_path):
    """
    Extracts audio from a given video file and saves it as a WAV file.

    Parameters:
        video_path (str): The path to the video file.

    Returns:
        str: The path to the saved audio file.
    """
    try:
        # Load the video
        video = VideoFileClip(video_path)
        
        # Extract audio from the video
        audio = video.audio
        
        # Define the output audio file path
        audio_path = os.path.splitext(video_path)[0] + "_audio.wav"
        
        # Write the audio to the file
        audio.write_audiofile(audio_path)
        
        # Close the video and audio to release resources
        video.close()
        audio.close()
        
        print(f"Audio extracted and saved to {audio_path}")
        return audio_path
    except Exception as e:
        print(f"Error extracting audio: {e}")
        return None


import vosk
import json
import wave
from pydub import AudioSegment
from googletrans import Translator
import os

# Path to the Vosk model for Hindi (ensure this path is correct)
MODEL_PATH = r"models/vosk/vosk-model-small-hi-0.22"
model2 = vosk.Model(MODEL_PATH)
# MODEL_PATH = r"G:\mars\vosk-model-small-hi-0.22"

# Path to the audio file (MP3 or WAV)
# AUDIO_FILE = r"bro2.mp3"

def ensure_wav_format(input_path):
    """Ensure the audio file is in WAV format with 16 kHz, mono, and 16-bit PCM."""
    try:
        # Define output WAV file path
        output_path = os.path.splitext(input_path)[0] + "_processed.wav"

        # Load the audio file using pydub
        audio = AudioSegment.from_file(input_path)

        # Convert to the correct format
        audio = audio.set_frame_rate(16000)  # Set sample rate to 16 kHz
        audio = audio.set_channels(1)       # Set to mono
        audio = audio.set_sample_width(2)   # Set to 16-bit PCM (2 bytes)

        # Export to a new WAV file
        audio.export(output_path, format="wav")
        print(f"Converted and formatted WAV file saved as: {output_path}")
        return output_path
    except Exception as e:
        print(f"Error ensuring WAV format: {e}")
        raise

def transcribe_and_translate(audio_file_path):
    """Transcribe an audio file and translate it to English."""
    try:
        # Ensure the file is in the correct WAV format
        audio_file_path = ensure_wav_format(audio_file_path)

        # Load the Vosk model
        recognizer = vosk.KaldiRecognizer(model2, 16000)

        # Initialize the translator
        translator = Translator()

        # Open the WAV file
        with wave.open(audio_file_path, "rb") as wf:
            # Initialize variables to accumulate the recognized Hindi text
            all_hindi_text = []

            # Read audio data in chunks
            while True:
                data = wf.readframes(4000)
                if len(data) == 0:
                    break

                # Process the audio data with the recognizer
                if recognizer.AcceptWaveform(data):
                    # Parse the recognized result
                    result = json.loads(recognizer.Result())
                    text = result.get("text", "")
                    if text:
                        # Print and store the recognized Hindi text
                        print(f"Recognized Hindi Text: {text}")
                        all_hindi_text.append(text)

            # Get the final recognition result
            final_result = json.loads(recognizer.FinalResult())
            final_text = final_result.get("text", "")
            if final_text:
                all_hindi_text.append(final_text)
                print(f"\nFinal Recognized Hindi Text: {final_text}")

            # Combine all recognized Hindi text
            hindi_text = " ".join(all_hindi_text)

            # Translate the Hindi text to English
            translated_text = translator.translate(hindi_text, src="hi", dest="en").text
            print(f"\nTranslated English Text: {translated_text}")

        return translated_text,hindi_text

    except Exception as e:
        print(f"An error occurred: {e}")



















