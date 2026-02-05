import { useEffect, useState } from 'react';
import styles from './Login.module.css';

const Login = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleDAuthLogin = () => {
     const CLIENT_ID = "6Fb-R8UuftYlNZU5";
    const REDIRECT_URI = 'https://benchbae.in/auth/callback';
    console.log(CLIENT_ID)
    // 2. Redirect to Delta
    // window.location.href = `https://auth.delta.nitt.edu/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&grant_type=authorization_code&scope=email+profile+user`;
    console.log(`https://auth.delta.nitt.edu/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&grant_type=authorization_code&scope=email+profile+user`)
  };

  return (
    <div className={styles.container}>
      {/* Decorative Circles */}
      <div className={styles.circleTop} />
      <div className={styles.circleBottom} />

      <div className={`${styles.content} ${isVisible ? styles.animateIn : ''}`}>
        <div className={styles.logoSection}>
          <div className={styles.logoBg}>
            <span className={styles.logoEmoji}>🔥</span>
          </div>
          <h1 className={styles.appName}>MATCHED</h1>
          <p className={styles.tagline}>Find your spark at NITT</p>
        </div>

        <div className={styles.actionSection}>
          <button 
            className={styles.dauthButton} 
            onClick={handleDAuthLogin}
          >
            <span className={styles.btnIcon}>🔒</span>
            Login with NITT Webmail
          </button>
          
          <p className={styles.disclaimer}>
            By continuing, you agree to our <span className={styles.link}>Terms</span> & <span className={styles.link}>Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;