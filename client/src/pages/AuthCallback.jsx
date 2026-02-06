import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const codeProcessed = useRef(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');

    if (code && !codeProcessed.current) {
      codeProcessed.current = true;

      axios.post('/api/auth/dauth', { 
        code,
        redirectUri: 'https://benchbae.in/auth/callback'
       })
        .then((res) => {
          const { token, user } = res.data;
          localStorage.setItem('authToken', token);
          
          if (user.onboardingComplete) {
            navigate('/terms');
          } else {
            navigate('/gender');
          }
        })
        .catch((err) => {
          console.error("Login Failed", err);
          navigate('/login');
        });
    }
  }, [searchParams, navigate]);

  // Changed 100vh to 100% to fit the parent container
  return (
    <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <h2>Verifying...</h2>
    </div>
  );
};

export default AuthCallback;