import React, { useState } from 'react';
import axios from 'axios';

const UserFeedback = ({ complaintD, handlePopupClose, setActiveTab }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [sentiment, setSentiment] = useState('');
  const [level, setLevel] = useState('');
  const [improvementArea, setImprovementArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [step, setStep] = useState(1); // Step 1: Enter feedback & rating, Step 2: Display sentiment & improvement area

  // Handle feedback submission
  const handleNext = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Call the Flask API to get sentiment score and improvement area
      const response = await axios.post('http://localhost:9898/v1/review_analysis/feedback_sentiment', {
        feedbacks: [feedback], // Send feedback as an array
      });

      if (response.data.status === 'success') {
        const { sentiment_score, central_idea,  time_and_actions} = response.data.results[0];
        setSentiment(sentiment_score.toFixed(2));
        setImprovementArea(central_idea + time_and_actions);

        // Set the level based on the sentiment score
        let sentimentLevel = '';
        if (sentiment_score <= 0.33) {
          sentimentLevel = 'low';
        } else if (sentiment_score <= 0.66) {
          sentimentLevel = 'moderate';
        } else {
          sentimentLevel = 'high';
        }
        setLevel(sentimentLevel);

        // Move to the next step
        setStep(2);
      } else {
        setErrorMessage('Failed to process sentiment and improvement area');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Handle final feedback submission
  const handleSubmit = async (e) => {
    console.log("submitbro");
    
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      
      const feedbackData = {
        complaintId: complaintD._id,
        feedback,
        rating : (Number(sentiment)*10)/2,
        sentiment,
        level,
        desc : improvementArea,
      };

      console.log(feedbackData);
      
      // Submit the feedback to your backend (for saving to the database)
      const submitResponse = await axios.post('http://localhost:3002/user/submitfeedback', feedbackData);
      alert(submitResponse.data.message); // Show success message
      
      handlePopupClose(); // Close the popup after successful submission
      setActiveTab('train'); // Optionally switch to complaints tab
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedbackDiv regForm">
      <h3>Give Feedback for Complaint</h3>
      <form onSubmit={step === 1 ? handleNext : handleSubmit}>
        {step === 1 && (
          <>
            <div>
              <p className='bhaikaisahai' htmlFor="feedback">Feedback:</p>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              />
            </div>
            <div>
              <button type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Next'}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div >
              <p className="bhaikaisahai" htmlFor="sentiment">Sentiment:</p>
              <input
                type="text"
                id="sentiment"
                value={sentiment === '' ? 'Loading...' : sentiment}
                readOnly
              />
            </div>
            <div>
              <p htmlFor="improve">Improvement Needed:</p>
              <input
                type="text"
                id="improve"
                value={improvementArea}
                readOnly
              />
            </div>
            <div>
              <p htmlFor="level">Level:</p>
              <input
                type="text"
                id="level"
                value={level}
                readOnly
              />
            </div>
            <div>
              <button type="submit" disabled={loading}>

                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </>
        )}

        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </form>
    </div>
  );
};

export default UserFeedback;
