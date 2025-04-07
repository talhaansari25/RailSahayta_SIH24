import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated import
import App from './App'; // Your main App component
import './index.css'; // Optional styles

// Create a root and render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
