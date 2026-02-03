// src/pages/AuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');

  useEffect(() => {
    if (code) {
      // Send the code to YOUR backend (not Delta directly)
      axios.post('http://localhost:5000/api/auth/dauth', { code })
        .then((response) => {
          // 1. Save your app's JWT token
          localStorage.setItem('authToken', response.data.token);
          // 2. Redirect to your onboarding or matching page
          navigate('/questions');
        })
        .catch((err) => {
          console.error("Login Failed", err);
          navigate('/login');
        });
    }
  }, [code, navigate]);

  return <div>Logging you in...</div>;
};

export default AuthCallback;