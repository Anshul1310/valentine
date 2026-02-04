import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Splash.module.css';

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        // No token found? Go to Onboarding start
        const timer = setTimeout(() => {
          navigate('/onboarding');
        }, 2500);
        return () => clearTimeout(timer);
      }

      try {
        // Verify token and check onboarding status
        const res = await axios.get('/api/user/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { onboardingComplete } = res.data;

        setTimeout(() => {
          if (onboardingComplete) {
            // If setup is done, show Terms before Home
            navigate('/terms');
          } else {
            // If setup is incomplete, restart data collection at Gender
            navigate('/gender');
          }
        }, 2500);

      } catch (error) {
        // If token is invalid or server error, reset and go to Onboarding
        console.error("Session check failed:", error);
        localStorage.removeItem('authToken');
        navigate('/onboarding');
      }
    };

    checkStatus();
  }, [navigate]);

  return (
    <div className={styles.splashContainer}>
      <div className={styles.logoBox}>
        <span>🔥</span>
      </div>
      <h1 className={styles.title}>MATCHED</h1>
    </div>
  );
};

export default Splash;