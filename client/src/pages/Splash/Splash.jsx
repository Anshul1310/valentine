// client/src/pages/Splash/Splash.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Lottie from 'lottie-react';
import styles from './Splash.module.css';

// Import your local JSON file here
import animationData from './animation.json'; 

const Splash = () => {
  const navigate = useNavigate();

  // Navigation Logic
  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem('authToken');

      // Helper to handle the navigation delay
      const delayedNavigate = (path) => {
        setTimeout(() => {
          // Using replace: true prevents the user from going back to Splash
          navigate(path, { replace: true });
        }, 2500); 
      };

      if (!token) {
        delayedNavigate('/onboarding');
        return;
      }

      try {
        const res = await axios.get('/api/user/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { onboardingComplete } = res.data;

        if (onboardingComplete) {
          delayedNavigate('/terms'); 
        } else {
          delayedNavigate('/questions');
        }

      } catch (error) {
        console.error("Session check failed:", error);
        localStorage.removeItem('authToken');
        delayedNavigate('/onboarding');
      }
    };

    checkStatus();
  }, [navigate]);

  return (
     <Lottie 
          animationData={animationData} 
          loop={true} 
          className={styles.lottiePlayer}
        />
  );
};

export default Splash;