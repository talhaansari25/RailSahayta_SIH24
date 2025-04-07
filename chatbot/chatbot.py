# import json
# from langchain_ollama import OllamaLLM
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.metrics.pairwise import cosine_similarity


# def load_knowledge(file_path):
#     with open(file_path, 'r') as file:
#         return file.read()


# def load_topics(file_path):
#     with open(file_path, 'r') as file:
#         return json.load(file)


# # Load knowledge base and topics
# knowledge = load_knowledge('knowledge.txt')
# topics = load_topics('topics.json')


# # Define the prompt template
# template = """
#     Context: {context}
#     Question: {question}
#     Give response for questions based on context. Don't deviate from the topic, and stick with the provided information.
# """

# # Initialize the model
# model = OllamaLLM(model="gemma:2b", server_url="http://localhost:11434", temperature=0.5, max_tokens= 10)  # Ensure your server is running


# def format_prompt(context, question):
#     """
#     Formats the prompt as a string using the provided template.
#     """
#     return template.format(context=context, question=question)


# def match_topic_in_response(response, topics, threshold=0.1):
#     """
#     Matches a topic in the response using cosine similarity and returns the most similar topic's answer and link.
#     """
#     topic_texts = list(topics.keys())  # Extract all topic titles
#     vectorizer = TfidfVectorizer().fit_transform([response] + topic_texts)
#     similarity_scores = cosine_similarity(vectorizer[0:1], vectorizer[1:]).flatten()  # Compare response to topics

#     # Find the best match above the threshold
#     best_match_index = similarity_scores.argmax()
#     if similarity_scores[best_match_index] > threshold:
#         topic = topic_texts[best_match_index]
#         data = topics[topic]
#         return data.get("answer", ""), data.get("link", "")
    
#     return '', ''


# def chatbot_loop():
#     """
#     Runs the chatbot in a loop, interacting with the user.
#     """
#     print("Chatbot is running. Type 'exit' to quit.\n")
    
#     while True:
#         user_input = input("You: ")
#         if user_input.lower() == "exit":
#             print("Chatbot: Goodbye!")
#             break

#         try:
#             # Format the input prompt
#             prompt_input = format_prompt(context=knowledge, question=user_input)

#             # Generate response from LLM
#             response = model.invoke(prompt_input)
#             print(f"Chatbot: {response}")

#             # Match response with topics and provide additional information
#             matched_res, matched_link = match_topic_in_response(user_input, topics)
#             if matched_res and matched_link:
#                 print(f"More info: {matched_res}\n{matched_link}")
        
#         except Exception as e:
#             print(f"Error: {e}")
#             break


# # Run the chatbot
# chatbot_loop()



import json
from langchain_ollama import OllamaLLM
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


def load_knowledge(file_path):
    with open(file_path, 'r') as file:
        return file.read()


def load_topics(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)


# Load knowledge base and topics
knowledge = load_knowledge('knowledge.txt')
topics = load_topics('topics.json')


# Define the prompt template to ensure shorter responses
template = """
    Context: {context}
    Question: {question}
    Provide a short and concise response based on the context. Keep it under 50 words.
"""

# Initialize the model with max_tokens set to 50 for shorter responses
model = OllamaLLM(model="gemma:2b", server_url="http://localhost:11434", temperature=0.5, max_tokens=30)  # Ensure your server is running


def format_prompt(context, question):
    """
    Formats the input as a string using the provided template.
    """
    return template.format(context=context, question=question)


def precompute_topic_vectors(topics):
    """
    Precompute the TF-IDF vectors for the topics to speed up cosine similarity calculation.
    """
    topic_texts = list(topics.keys())  # Extract all topic titles
    vectorizer = TfidfVectorizer()
    topic_vectors = vectorizer.fit_transform(topic_texts)  # Precompute the vectors
    return vectorizer, topic_vectors


# Precompute the topic vectors once, so we don't recompute every time
vectorizer, topic_vectors = precompute_topic_vectors(topics)

# Cache storage for storing previously computed responses
response_cache = {}

def get_cached_response(question):
    """
    Checks if the response for the given question is cached.
    """
    if question in response_cache:
        return response_cache[question]
    return None

def cache_response(question, response):
    """
    Caches the response for the given question.
    """
    response_cache[question] = response


def match_topic_in_response(response, topics, vectorizer, topic_vectors, threshold=0.1):
    """
    Matches a topic in the response using cosine similarity and returns the most similar topic's answer and link.
    """
    user_input_vector = vectorizer.transform([response])  # Vectorize the user input
    similarity_scores = cosine_similarity(user_input_vector, topic_vectors).flatten()  # Compare user input to topics

    # Find the best match above the threshold
    best_match_index = similarity_scores.argmax()
    if similarity_scores[best_match_index] > threshold:
        topic = list(topics.keys())[best_match_index]
        data = topics[topic]
        return data.get("answer", ""), data.get("link", "")
    
    return '', ''


def chatbot_loop():
    """
    Runs the chatbot in a loop, interacting with the user.
    """
    print("Chatbot is running. Type 'exit' to quit.\n")
    
    while True:
        user_input = input("You: ")

        if user_input.lower() == "exit":
            print("Chatbot: Goodbye!")
            break
        
        # Check if the response for this question is cached
        cached_response = get_cached_response(user_input)
        if cached_response:
            print(f"Chatbot: {cached_response}")
            continue  # Skip processing and directly use cached response

        try:
            # Format the input prompt
            prompt_input = format_prompt(context=knowledge, question=user_input)

            # Generate response from LLM with a shorter max_tokens
            response = model.invoke(prompt_input)
            print(f"Chatbot: {response}")

            # Match response with topics and provide additional information
            matched_res, matched_link = match_topic_in_response(user_input, topics, vectorizer, topic_vectors)
            if matched_res and matched_link:
                print(f"More info: {matched_res}\n{matched_link}")

            # Cache the generated response for future use
            cache_response(user_input, response)
        
        except Exception as e:
            print(f"Error: {e}")
            break


# Run the chatbot
chatbot_loop()
