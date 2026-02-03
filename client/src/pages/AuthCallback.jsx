import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const codeProcessed = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');

    if (code && !codeProcessed.current) {
      codeProcessed.current = true;

      axios.post('http://localhost:5000/api/auth/dauth', { code })
        .then((res) => {
          const { token, user } = res.data;
          localStorage.setItem('authToken', token);
          
          if (user.onboardingComplete) {
            navigate('/terms');
          } else {
            // New Flow: Always go to Gender first for setup
            navigate('/gender');
          }
        })
        .catch((err) => {
          console.error("Login Failed", err);
          navigate('/login');
        });
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <h2>Verifying...</h2>
    </div>
  );
};

export default AuthCallback;