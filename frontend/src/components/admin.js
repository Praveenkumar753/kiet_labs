import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
  const navigate = useNavigate(); // Initialize useNavigate hook for navigation

  // Navigate to different pages
  const navigateToPage1 = () => navigate('/addstudent');
  const navigateToPage2 = () => navigate('/responses');
  const navigateToPage3 = () => navigate('/show');
  const navigateToPage4 = () => navigate('/upload');

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Clear token from localStorage
    navigate('/login'); // Redirect to login page
  };

  return (
    <div>
      <h1>Welcome to the Admin Page</h1>
      <p>Select a page to navigate to:</p>
      <button onClick={navigateToPage4}>Add Data To The Database</button>
      <button onClick={navigateToPage1}>Add Student</button>
      <button onClick={navigateToPage2}>Form Responses</button>
      <button onClick={navigateToPage3}>Modify Students Data</button>
      
      <button onClick={handleLogout} style={{ marginTop: '1rem', backgroundColor: 'red', color: 'white' }}>
        Logout
      </button>
    </div>
  );
}

export default AdminPage;
