import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserView from './components/UserView';
import AdminView from './components/AdminView';
import VideoCall from './components/VideoCall';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/user" element={<UserView />} />
        <Route path="/admin" element={<AdminView />} />
        <Route path="/user/:id" element={<VideoCall />} /> {/* Route for video call */}
      </Routes>
    </Router>
  );
};

export default App;
