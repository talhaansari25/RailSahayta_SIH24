from flask import Flask, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from flask_cors import CORS 


import json
from langchain_ollama import OllamaLLM
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

CORS(app)





def load_knowledge(file_path):
    with open(file_path, 'r') as file:
        return file.read()


def load_topics(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)


# Load knowledge base and topics
knowledge = load_knowledge('knowledge.txt')
topics = load_topics('topics.json')


# Define the prompt template
template = """
    Context: {context}
    Question: {question}
    Give response for questions based on context. Don't deviate from the topic, and stick with the provided information.
"""

# Initialize the model
model = OllamaLLM(model="gemma:2b", server_url="http://localhost:11434", temperature=0.5, max_tokens= 150)  # Ensure your server is running


def format_prompt(context, question):
    """
    Formats the prompt as a string using the provided template.
    """
    return template.format(context=context, question=question)


def match_topic_in_response(response, topics, threshold=0.1):
    """
    Matches a topic in the response using cosine similarity and returns the most similar topic's answer and link.
    """
    topic_texts = list(topics.keys())  # Extract all topic titles
    vectorizer = TfidfVectorizer().fit_transform([response] + topic_texts)
    similarity_scores = cosine_similarity(vectorizer[0:1], vectorizer[1:]).flatten()  # Compare response to topics

    # Find the best match above the threshold
    best_match_index = similarity_scores.argmax()
    if similarity_scores[best_match_index] > threshold:
        topic = topic_texts[best_match_index]
        data = topics[topic]
        return data.get("answer", ""), data.get("link", "")
    
    return '', ''



# Initialize Limiter
limiter = Limiter(
    get_remote_address,  # Use the client's IP address to track requests
    app=app,
    default_limits=["100 per minute"]  # Default limit for all endpoints
)


@app.route('/railbot', methods=['POST'])
@limiter.limit("20 per minute")  
def get_data():
    try:
        data = request.get_json()
        if 'text' not in data:
            return jsonify({'error': 'Text field is missing'}), 400

        user_input = data['text']

        prompt_input = format_prompt(context=knowledge, question=user_input)
        response = model.invoke(prompt_input)

        matched_res, matched_link = match_topic_in_response(user_input, topics)
        if matched_res and matched_link:
            return jsonify(
                {
                    "railBot":response,
                    "extras": matched_res,
                    "links":matched_link 
                }), 200
        return jsonify({"railBot":response}), 200








    except Exception as e:
        return {"Error":e}, 500
    


# Error handler for rate limit exceeded
@app.errorhandler(429)
def ratelimit_error(e):
    return jsonify(error="ratelimit exceeded", message=str(e.description)), 429





if __name__ == "__main__":
    app.run(debug=True, port=1010)
