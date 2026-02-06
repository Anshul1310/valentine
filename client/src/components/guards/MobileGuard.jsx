import { useState, useEffect } from 'react';
import styles from './MobileGuard.module.css';

const MobileGuard = ({ children }) => {
  // Allow if width is small OR if it's likely a mobile device (touch capable)
  const isMobileDevice = () => {
    return (
      window.innerWidth < 768 || 
      navigator.maxTouchPoints > 0 ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    );
  };

  const [isMobile, setIsMobile] = useState(isMobileDevice());

  useEffect(() => {
    const handleResize = () => setIsMobile(isMobileDevice());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile) {
    return (
      <div className={styles.desktopWarning}>
        <h1>📱 Please switch to a mobile device.</h1>
        <p>This experience is designed for smaller screens.</p>
        {/* OPTIONAL: Add a bypass button if the detection is wrong */}
        <button 
            style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ff4b6e', color: 'white', fontWeight: 'bold' }}
            onClick={() => setIsMobile(true)}
        >
            I am on Mobile (Continue)
        </button>
      </div>
    );
  }

  return <div className={styles.container}>{children}</div>;
};

export default MobileGuard;