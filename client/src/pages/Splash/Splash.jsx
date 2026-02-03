import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Splash.module.css';

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem('authToken');
      if (token) {
        navigate('/questions');
      } else {
        navigate('/onboarding');
      }
    }, 2500);

    return () => clearTimeout(timer);
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