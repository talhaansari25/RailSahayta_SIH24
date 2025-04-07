import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setIsAuthenticated, setUserData, handlePopupClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (loading) return <div className="loader"></div>

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true)

    try {
      const response = await axios.post("http://localhost:3002/auth/login", {
        email,
        password,
      });

      if (response.status === 200) {

        console.log(response.data);
        
        localStorage.setItem('userId', response.data.user._id);
        localStorage.setItem('userType', "user");
        setLoading(false)
        setIsAuthenticated(true);
        console.log(response.data.user);
        
        setUserData(response.data.user); // Optionally store user data
        handlePopupClose();
       
      } else {
        setLoading(false)
        setErrorMessage('Invalid credentials!');

      }
    } catch (error) {
      setLoading(false)
      setErrorMessage('Login failed, please try again!');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="regForm">
      <h3>User Sign In</h3>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          className='pri12'
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
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

export default Login;
