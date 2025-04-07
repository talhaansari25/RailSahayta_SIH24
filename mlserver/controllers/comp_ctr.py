# import os
# import torch
# from torchvision.models.detection import maskrcnn_resnet50_fpn
# from torchvision.transforms import functional as F
# from PIL import Image, ImageDraw
# import matplotlib.pyplot as plt
# import json
# import numpy as np


# def load_model(model_path, num_classes, device):
#     model = maskrcnn_resnet50_fpn(num_classes=num_classes)
#     model.load_state_dict(torch.load(model_path, map_location=device))
#     model.to(device)
#     model.eval()
#     return model


# def draw_boxes(image, boxes, labels, title="Image"):
#     draw = ImageDraw.Draw(image)
#     for box, label in zip(boxes, labels):
#         x_min, y_min, x_max, y_max = box
#         draw.rectangle([x_min, y_min, x_max, y_max], outline="red", width=2)
#         draw.text((x_min, y_min), str(label), fill="red")
#     plt.imshow(image)
#     plt.title(title)
#     plt.axis("off")


# def main():
#     # Paths
#     model_path = "../models/mask_rcnn/mask_rcnn_model.pth"
#     image_path = "image38.jpeg"
#     # annotation_file = "organized_data/annotations/val.json"  # Optional if ground truth is needed
#     num_classes = 61  # 1 background + 60 categories

#     # Device
#     device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
#     print(f"Using device: {device}")

#     # Load the model
#     model = load_model(model_path, num_classes, device)

#     # Check if the image exists
#     if not os.path.exists(image_path):
#         print(f"Image not found: {image_path}")
#         return

#     # Load and preprocess image
#     original_image = Image.open(image_path).convert("RGB")
#     image_tensor = F.to_tensor(original_image).to(device).unsqueeze(0)

#     # Get predictions
#     with torch.no_grad():
#         outputs = model(image_tensor)
#     pred_boxes = outputs[0]["boxes"].cpu().numpy()
#     pred_labels = outputs[0]["labels"].cpu().numpy()
#     pred_scores = outputs[0]["scores"].cpu().numpy()

#     # Plot predictions
#     pred_image = original_image.copy()
#     draw_boxes(pred_image, pred_boxes, pred_labels, title="Predictions")

#     # Show predictions
#     plt.figure(figsize=(6, 6))
#     plt.imshow(pred_image)
#     plt.title("Predictions")
#     plt.axis("off")
#     plt.show()

#     # Print results
#     print("Predictions:")
#     for box, label, score in zip(pred_boxes, pred_labels, pred_scores):
#         print(f"Box: {box}, Label: {label}, Score: {score:.2f}")


# main()




import torch
from torchvision.models.detection import maskrcnn_resnet50_fpn
from torchvision.transforms import functional as F
from PIL import Image, ImageDraw
import io


class DetectionController:
    def __init__(self, model_path, num_classes, device=None):
        """
        Initialize the DetectionController with the model.
        """
        self.device = device or torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self.load_model(model_path, num_classes)

    def load_model(self, model_path, num_classes):
        """
        Load the pre-trained Mask R-CNN model.
        """
        model = maskrcnn_resnet50_fpn(num_classes=num_classes)
        model.load_state_dict(torch.load(model_path, map_location=self.device))
        model.to(self.device)
        model.eval()
        return model

    def preprocess_image(self, image_bytes):
        """
        Convert the image bytes into a tensor for the model.
        """
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_tensor = F.to_tensor(image).to(self.device).unsqueeze(0)
        return image, image_tensor

    def predict(self, image_tensor):
        """
        Perform inference on the image tensor.
        """
        with torch.no_grad():
            outputs = self.model(image_tensor)

        pred_boxes = outputs[0]["boxes"].cpu().numpy().tolist()
        pred_labels = outputs[0]["labels"].cpu().numpy().tolist()
        pred_scores = outputs[0]["scores"].cpu().numpy().tolist()

        return pred_boxes, pred_labels, pred_scores

    # def draw_boxes(self, image, boxes, labels):
    #     """
    #     Draw bounding boxes on the image.
    #     """
    #     draw = ImageDraw.Draw(image)
    #     for box, label in zip(boxes, labels):
    #         x_min, y_min, x_max, y_max = box
    #         draw.rectangle([x_min, y_min, x_max, y_max], outline="red", width=2)
    #         draw.text((x_min, y_min), str(label), fill="red")
    #     return image
