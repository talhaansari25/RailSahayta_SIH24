from flask import Blueprint, request, jsonify
import os
import controllers.feedback_ctr as feedback_ctr

api_routes_feedback = Blueprint("api_routes_feedback", __name__)


@api_routes_feedback.route("/feedback_sentiment", methods=["POST"])
def feedback_sentiment():
    try:
        # Get JSON data
        data = request.json
        feedbacks = data.get('feedbacks', [])

        # Initialize results
        results = []

        for feedback in feedbacks:
            processed_feedback = feedback_ctr.preprocess_feedback(feedback)
            time_and_actions = feedback_ctr.extract_time_and_action_entities(processed_feedback)
            central_idea = feedback_ctr.extract_central_idea(processed_feedback)
            sentiment = feedback_ctr.predict_sentiment(feedback)
            improvement_area = feedback_ctr.detect_improvement_area(sentiment, central_idea)

            results.append({
                "original_feedback": feedback,
                "processed_feedback": processed_feedback,
                "time_and_actions": time_and_actions,
                "central_idea": central_idea,
                "sentiment_score": sentiment,
                "improvement_area": improvement_area
            })

        return jsonify({"status": "success", "results": results}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
