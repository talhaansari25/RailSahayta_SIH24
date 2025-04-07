

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
import numpy as np

# Import API routes
from views.seat_routes import api_routes_seat
from views.window_routes import api_routes_win
from views.feedback_routes import api_routes_feedback
from views.text_catg_route import api_routes_text_catg
from views.violence_routes import api_routes_violence
from views.ocr_routes import api_routes_ocr
from views.comp_routes import api_routes_comp
from views.img_category_routes import api_routes_img_category
from views.translate_route import api_route_translate

print("NumPy version:", np.__version__)
print("Imports successful...")

app = Flask(__name__)
# Apply CORS with specific configuration to handle preflight requests
# CORS(app, supports_credentials=True, resources={
#     r"/*": {
#         # "origins": "*",  # Update this if needed for other environments
#         "origins": ["http://localhost:5173","http://192.168.84.79:800", "*"],  # Update this if needed for other environments
#         "methods": ["GET", "POST", "OPTIONS"],
#         "allow_headers": ["Content-Type", "Authorization"],
#     }
# })

CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": ["http://localhost:5173","*"],  # Allowed origins
        "methods": ["GET", "POST", "OPTIONS"],  # Allowed HTTP methods
        "allow_headers": ["Content-Type", "Authorization"],  # Allowed headers
    }
})
# CORS(app, supports_credentials=True, resources={
#     r"/*": {
#         "origins": ["http://localhost:5173", "http://192.168.84.79:800", "http://172.16.9.139:56949", "http://192.168.18.23:56949", "*"],  # Allowed origins
#         "methods": ["GET", "POST", "OPTIONS"],  # Allowed HTTP methods
#         "allow_headers": ["Content-Type", "Authorization"],  # Allowed headers
#     }
# })


# Initialize limiter
limiter = Limiter(get_remote_address, default_limits=["3 per second"])

# Load and preprocess the complaint data
df = pd.read_csv('./models/dataset/complaintdata.csv')
df['startTime'] = pd.to_datetime(df['startTime'])
df['month'] = df['startTime'].dt.to_period('M')
complaint_counts = df.groupby(['month', 'category']).size().unstack(fill_value=0)

# Sample mapping of categories to departments
categories_info = {
    "damage_seat": {"department": "Mechanical"},
    "damage_window": {"department": "Mechanical"},
    "food": {"department": "Catering"},
    "unhygenic_compartment": {"department": "Hygiene"},
    "unhygenic_toilet": {"department": "Hygiene"},
    "violence": {"department": "Security"},
    "management": {"department": "Management"},
    "ticketing issue": {"department": "Commercial"},
    "security": {"department": "Security"},
    "Electricity": {"department": "Electrical"},
    "medical": {"department": "Medical"},
}

# Forecasting function
def forecast_category(category_data, periods=3):
    if len(category_data) < 5 or category_data.sum() == 0:
        return [0] * periods
    try:
        model = ARIMA(category_data, order=(1, 1, 1))
        model_fit = model.fit()
        forecast = model_fit.forecast(steps=periods)
        return list(forecast.values)
    except Exception:
        return [0] * periods

# API endpoint for forecasting
def forecast_api():
    data = request.json
    department = data.get('department')
    if not department:
        return jsonify({"error": "Please provide a department."}), 400

    if department.lower() == "railway":
        relevant_categories = complaint_counts.columns
    else:
        relevant_categories = [
            category for category, info in categories_info.items()
            if info['department'].lower() == department.lower()
        ]

    if len(relevant_categories) == 0:
        return jsonify({"error": "No categories found for the given department."}), 404

    response = {}
    for category in relevant_categories:
        if category not in complaint_counts.columns:
            continue

        category_data = complaint_counts[category]
        plot_data = {str(key): value for key, value in category_data.to_dict().items()}
        forecast = forecast_category(category_data)

        response[category] = {
            "plot_data": plot_data,
            "forecast": forecast,
        }

    return jsonify(response)

# Function to create the Flask app
def create_app():
    app.config.from_object("config.Config")
    limiter.init_app(app)

    app.register_blueprint(api_routes_seat, url_prefix=f"/{app.config['VERSION']}/severity")
    app.register_blueprint(api_routes_win, url_prefix=f"/{app.config['VERSION']}/severity")
    app.register_blueprint(api_routes_feedback, url_prefix=f"/{app.config['VERSION']}/review_analysis")
    app.register_blueprint(api_routes_text_catg, url_prefix=f"/{app.config['VERSION']}/text")
    app.register_blueprint(api_routes_violence, url_prefix=f"/{app.config['VERSION']}/violence")
    app.register_blueprint(api_routes_ocr, url_prefix=f"/{app.config['VERSION']}/ocr")
    app.register_blueprint(api_routes_comp, url_prefix=f"/{app.config['VERSION']}/severity")
    app.register_blueprint(api_routes_img_category, url_prefix=f"/{app.config['VERSION']}")
    app.register_blueprint(api_route_translate, url_prefix=f"/{app.config['VERSION']}")
    
    app.add_url_rule('/v1/forecast', view_func=forecast_api, methods=['POST'])
    
    print("Routes set up...")
    return app

# Run the app
if __name__ == '__main__':
    app = create_app()
    print("App is running...")
    app.run(host="0.0.0.0", port=9898, debug=True)
