import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const BASE_URL = 'http://localhost:5000';
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Handle login form submission
  const handleLogin = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
      if (response.status === 200) {
        setIsOtpSent(true);
        setSuccess('OTP sent to your email!');
        setError('');
      }
    } catch (error) {
      setSuccess('');
      setError(error.response ? error.response.data : 'An error occurred');
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/verify-otp`, { email, otp });
      if (response.status === 200) {
        const token = response.data.token; // Extract token from response
        localStorage.setItem('authToken', token); // Save token to localStorage
        setSuccess('Login successful!');
        setError('');
        setTimeout(() => {
          navigate('/admin'); // Redirect to the Admin Page
        }, 500);
      }
    } catch (error) {
      setSuccess('');
      setError(error.response ? error.response.data : 'Invalid OTP or an error occurred');
    }
  };

  return (
    <div style={{ margin: '2rem auto', width: '300px', textAlign: 'center' }}>
      <h2>Login</h2>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}

      {!isOtpSent ? (
        <div>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: 'block', marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: 'block', marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
          />
          <button onClick={handleLogin} style={{ padding: '0.5rem 1rem' }}>
            Login
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ display: 'block', marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
          />
          <button onClick={handleVerifyOtp} style={{ padding: '0.5rem 1rem' }}>
            Verify OTP
          </button>
        </div>
      )}
    </div>
  );
}

export default Login;
