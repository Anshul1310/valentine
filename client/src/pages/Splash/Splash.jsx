// client/src/pages/Splash/Splash.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Lottie from 'lottie-react';
import styles from './Splash.module.css';

// Import your local JSON file here
import animationData from './animation.json'; 

const Splash = () => {
  const navigate = useNavigate();
  const [installPrompt, setInstallPrompt] = useState(null);

  // 1. Listen for the 'Add to Home Screen' event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    // Show the install prompt
    installPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, so clear it
    setInstallPrompt(null);
  };

  // 2. Navigation Logic
  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem('authToken');

      // Helper to handle the navigation delay
      const delayedNavigate = (path) => {
        setTimeout(() => {
          navigate(path);
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
          delayedNavigate('/terms'); // Or /home based on your flow
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