// src/pages/AuthCallback/AuthCallback.jsx
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const codeProcessed = useRef(false); // Prevent double-firing in React Strict Mode

  useEffect(() => {
    const code = searchParams.get('code');

    if (code && !codeProcessed.current) {
      codeProcessed.current = true;

      // Send code to YOUR backend
      axios.post('http://localhost:5000/api/auth/dauth', { code })
        .then((res) => {
          const { token, user } = res.data;
          
          // 1. Store Token
          localStorage.setItem('authToken', token);
          
          // 2. Decide where to go
          if (user.onboardingComplete) {
            navigate('/matching');
          } else {
            navigate('/questions');
          }
        })
        .catch((err) => {
          console.error("Login Failed", err);
          alert("Login failed! Please try again.");
          navigate('/login');
        });
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <h2>Verifying with Delta...</h2>
    </div>
  );
};

export default AuthCallback;