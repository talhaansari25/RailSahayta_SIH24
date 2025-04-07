from flask import Flask, request, jsonify,Blueprint
from googletrans import Translator
import os

translator = Translator()

api_route_translate = Blueprint("api_route_translate", __name__)

@api_route_translate.route("/translate", methods=["POST"])
def translate_to_english():
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({'error': 'Missing "text" parameter'}), 400

    text = data['text']

    try:
        # Translate text to English
        translated = translator.translate(text, dest='en')
        response = {
            'original_text': text,
            'translated_text': translated.text,
            'source_language': translated.src
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500