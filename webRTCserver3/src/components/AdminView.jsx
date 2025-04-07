import React, { useState, useEffect } from 'react';

const AdminView = () => {
  const [userUrls, setUserUrls] = useState([]);
  const socket = new WebSocket('ws://localhost:8080');

  useEffect(() => {
    socket.onopen = () => {
      // Notify server that admin is connected
      socket.send(JSON.stringify({ type: 'admin' }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        setUserUrls(data.userUrls);
      }
    };
  }, []);

  return (
    <div>
      <h1 className='adminH'>Admin Panel</h1>
      <ul>
        {userUrls.map((user, index) => (
          <li key={index}>
            
            <a href={user.url} target="_blank" rel="noopener noreferrer">
             <i className='fas fa-user'></i>   User {index + 1}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminView;
