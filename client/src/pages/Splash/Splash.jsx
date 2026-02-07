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

  useEffect(() => {
    const checkStatus = async () => {
      // 1. Check for token immediately
      const token = localStorage.getItem('authToken');

      // Helper to handle the navigation delay
      const delayedNavigate = (path) => {
        setTimeout(() => {
          navigate(path);
        }, 2500); // 2.5s delay to let animation play
      };

      if (!token) {
        // No token found? Go to Onboarding start
        delayedNavigate('/onboarding');
        return;
      }

      try {
        // 2. Verify token and check onboarding status
        const res = await axios.get('/api/user/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { onboardingComplete } = res.data;

        if (onboardingComplete) {
          // If setup is done, show Terms before Home
          delayedNavigate('/terms');
        } else {
          // If setup is incomplete, skip Gender and go strictly to Questions
          delayedNavigate('/questions');
        }

      } catch (error) {
        // If token is invalid or server error, reset and go to Onboarding
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