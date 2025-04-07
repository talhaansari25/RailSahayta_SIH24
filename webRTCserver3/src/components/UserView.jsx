import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserView = () => {
  const navigate = useNavigate();
  const socket = new WebSocket('ws://localhost:8080');

  useEffect(() => {
    // Generate unique URL ID
    const uniqueId = Math.random().toString(36).substr(2, 8);
    const userUrl = `http://localhost:8081/#${uniqueId}`;

    // Send the URL to the server
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'user', url: userUrl }));
    };

    // Navigate to the video call page
    setTimeout(() => {
        window.location.href = userUrl;
    }, 2000);

  }, []);

  return <div>Redirecting to your unique video call...</div>;
};

export default UserView;
