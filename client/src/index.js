import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import MobileGuard from './components/guards/MobileGuard';
import axios from 'axios';

// --- Global Axios Interceptor ---
// This ensures that if ANY request fails due to invalid token/user (401/404),
// the user is immediately logged out and sent to onboarding.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 404)) {
      const token = localStorage.getItem('authToken');
      if (token) {
        console.warn("Session invalid or user not found. Logging out.");
        localStorage.removeItem('authToken');
        
        // Force redirect if not already on onboarding
        if (!window.location.pathname.includes('/onboarding')) {
          window.location.href = '/onboarding';
        }
      }
    }
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MobileGuard>
      <App />
    </MobileGuard>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();