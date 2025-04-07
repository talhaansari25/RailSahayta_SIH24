# import os
# import tensorflow as tf
# from tensorflow.keras.preprocessing import image
# import numpy as np
# # import matplotlib.pyplot as plt

# from io import BytesIO
# from PIL import Image
# # import base64

# from keras.layers import TFSMLayer


# MODEL_PATH = 'models/imgCat/VGG16_saved_model'  # Path to the saved model
# IMG_HEIGHT = 224
# IMG_WIDTH = 224
# CLASS_NAMES = ['bags','bedroll','charging_port','seat', 'window','door', 'fan','food', 'medical','packaged_food','unhyg_comp', 'unhyg_toilet', 'unhyg_washroom', 'violence', 'win_img']  # Update with actual class names


# def load_model():
#     # Load the trained model
#     model = TFSMLayer(MODEL_PATH, call_endpoint="serving_default")
#     return model

# def preprocess_image(image_data, image_size=(IMG_HEIGHT, IMG_WIDTH)):

#     img = Image.open(BytesIO(image_data))
#     img = img.convert("RGB") 
#     img = img.resize(image_size)  
#     img_array = np.array(img)  
#     img_array = np.expand_dims(img_array, axis=0) 
#     img_array = img_array / 255.0  
#     return img_array


# def predict_image(model, image_data):
    
#     img_array = preprocess_image(image_data)
#     predictions = model(img_array)

#     if isinstance(predictions, dict):
#         # Assuming single output key for classification
#         key = list(predictions.keys())[0]  
#         output = predictions[key].numpy()
#     else:
#         output = predictions.numpy()

#     output = np.array(output)
#     predicted_class = np.argmax(output, axis=1)
#     predicted_class_name = CLASS_NAMES[predicted_class[0]]
#     confidence = float(np.max(output))
#     return predicted_class_name, confidence























# FRAME_INTERVAL = 1  
# FFMPEG_PATH = "C:\\ffmpeg\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg"  # Replace with actual path
# os.environ["PATH"] += os.pathsep + os.path.dirname(FFMPEG_PATH)
# from tensorflow.keras.preprocessing import image

# def preprocess_image2(img):
#     """Preprocess the image for model prediction."""
#     img = img.resize((IMG_HEIGHT, IMG_WIDTH))
#     img_array = image.img_to_array(img)
#     img_array = np.expand_dims(img_array, axis=0)
#     img_array = img_array / 255.0
#     return img_array


# def predict_image2(img,modelImage):
#     """Predict the class of a single image."""
#     img_array = preprocess_image2(img)
#     predictions = modelImage(img_array)
#     if isinstance(predictions, dict):
#         # Assuming single output key for classification
#         key = list(predictions.keys())[0]  
#         output = predictions[key].numpy()
#     else:
#         output = predictions.numpy()
#     output = np.array(output)
#     predicted_class = np.argmax(output, axis=1)
#     predicted_class_name = CLASS_NAMES[predicted_class[0]]
#     confidence = float(np.max(output))
#     return predicted_class_name, confidence

# import random 

# def process_video_frames_sequential(video, model, num_frames=5):
#     frame_results = []
#     confidence_res = []
#     video_duration = video.duration
#     random_timestamps = sorted(random.sample(np.linspace(0, video_duration, num=100).tolist(), num_frames))

#     for t in random_timestamps:
#         frame = video.get_frame(t)
#         predicted_class_name, confidence = predict_image2(image.array_to_img(frame), model)
#         frame_results.append(predicted_class_name)
#         confidence_res.append(confidence)

#     most_frequent_class = max(set(frame_results), key=frame_results.count)
#     # most_confidence = max(set(confidence_res), key=confidence_res.count)
#     return most_frequent_class,confidence




import os 
import tensorflow as tf 
from tensorflow.keras.preprocessing import image 
import numpy as np 
# import matplotlib.pyplot as plt 
 
from io import BytesIO 
from PIL import Image 
# import base64 
import random
 
from keras.layers import TFSMLayer 
 
 
MODEL_PATH = 'models/imgCat/VGG16_saved_model'  # Path to the saved model 
MODEL_PATH_station = 'models/imgCat/station_best_saved_model'  # Path to the saved model 
IMG_HEIGHT = 224 
IMG_WIDTH = 224 
CLASS_NAMES = ['bags','bedroll','chg','seat', 'window','door', 'fan','food', 'medical','packaged food','unhyg_comp', 'unhyg_toilet', 'unhyg_washroom', 'violenve', 'win_img']  # Update with actual class names 
CLASS_NAMES_station =  ['RailFan', 'bags', 'benches', 'board', 'charging', 'crowded platform', 'dirty platform', 'esc', 'lift', 'medical', 'packagedFood', 'unhyg_toilet', 'violence'] 
 
def load_model(): 
    # Load the trained model 
    model = TFSMLayer(MODEL_PATH, call_endpoint="serving_default") 
    return model 
 
def load_model_station(): 
    # Load the trained model 
    model = TFSMLayer(MODEL_PATH_station, call_endpoint="serving_default") 
    return model 
 
 
def preprocess_image(image_data, image_size=(IMG_HEIGHT, IMG_WIDTH)): 
 
    img = Image.open(BytesIO(image_data)) 
    img = img.convert("RGB")  
    img = img.resize(image_size)   
    img_array = np.array(img)   
    img_array = np.expand_dims(img_array, axis=0)  
    img_array = img_array / 255.0   
    return img_array 
 
 
def predict_image(model, image_data): 
     
    img_array = preprocess_image(image_data) 
    predictions = model(img_array) 
 
    if isinstance(predictions, dict): 
        # Assuming single output key for classification 
        key = list(predictions.keys())[0]   
        output = predictions[key].numpy() 
    else: 
        output = predictions.numpy() 
 
    output = np.array(output) 
    predicted_class = np.argmax(output, axis=1) 
    predicted_class_name = CLASS_NAMES[predicted_class[0]] 
    confidence = float(np.max(output)) 
    return predicted_class_name, confidence 
 
def predict_image_station(model, image_data): 
     
    img_array = preprocess_image(image_data) 
    predictions = model(img_array) 
 
    if isinstance(predictions, dict): 
        # Assuming single output key for classification 
        key = list(predictions.keys())[0]   
        output = predictions[key].numpy() 
    else: 
        output = predictions.numpy() 
 
    output = np.array(output) 
    predicted_class = np.argmax(output, axis=1) 
    predicted_class_name = CLASS_NAMES_station[predicted_class[0]] 
    confidence = float(np.max(output)) 
    return predicted_class_name, confidence 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
FRAME_INTERVAL = 1   
FFMPEG_PATH = "C:\\ffmpeg\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg"  # Replace with actual path 
os.environ["PATH"] += os.pathsep + os.path.dirname(FFMPEG_PATH) 
from tensorflow.keras.preprocessing import image 
 
def preprocess_image2(img): 
    """Preprocess the image for model prediction.""" 
    img = img.resize((IMG_HEIGHT, IMG_WIDTH)) 
    img_array = image.img_to_array(img) 
    img_array = np.expand_dims(img_array, axis=0) 
    img_array = img_array / 255.0 
    return img_array 
 
 
def predict_image2(img,modelImage,stationinner=False): 
    """Predict the class of a single image.""" 
    img_array = preprocess_image2(img) 
    predictions = modelImage(img_array) 
    if isinstance(predictions, dict): 
        # Assuming single output key for classification 
        key = list(predictions.keys())[0]   
        output = predictions[key].numpy() 
    else: 
        output = predictions.numpy() 
    output = np.array(output) 
    predicted_class = np.argmax(output, axis=1) 
    predicted_class_name = CLASS_NAMES_station[predicted_class[0]] if stationinner else  CLASS_NAMES[predicted_class[0]] 
    confidence = float(np.max(output)) 
    return predicted_class_name, confidence 

def process_video_frames_sequential(video, model, num_frames=5,station=False):
    frame_results = []
    confidence_res = []
    video_duration = video.duration
    random_timestamps = sorted(random.sample(np.linspace(0, video_duration, num=100).tolist(), num_frames))

    for t in random_timestamps:
        frame = video.get_frame(t)
        predicted_class_name, confidence = predict_image2(image.array_to_img(frame), model,stationinner=station)
        frame_results.append(predicted_class_name)
        confidence_res.append(confidence)

    most_frequent_class = max(set(frame_results), key=frame_results.count)
    # most_confidence = max(set(confidence_res), key=confidence_res.count)
    return most_frequent_class,confidence


