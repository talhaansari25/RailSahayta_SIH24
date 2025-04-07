import React, { useState } from 'react';
import axios from 'axios';

const StaffLogin = ({ setIsAuthenticated, setUserData, handlePopupClose , setPopupType}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (loading) return <div className="loader"></div>; 

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3002/staff/loginstaff", { email, password });

      if (response.status === 200) {
        console.log(response.data);

        localStorage.setItem('userId', response.data.staff._id);
        localStorage.setItem('userType', "staff");
        setIsAuthenticated(true);
        setUserData(response.data.staff); // Optionally store user data
        setLoading(false);
        setPopupType(null)
        handlePopupClose(); // Close the login popup
      } else {
        setLoading(false);
        setErrorMessage('Invalid credentials!');
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage('Login failed, please try again!');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="regForm">
      <h3>Staff Sign In</h3>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          className='pri12'
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <p>Enter your Correct Password</p>
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        {errorMessage && <p className="error">{errorMessage}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default StaffLogin;
