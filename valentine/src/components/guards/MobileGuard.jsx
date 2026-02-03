import { useState, useEffect } from 'react';
import styles from './MobileGuard.module.css';

const MobileGuard = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile) {
    return (
      <div className={styles.desktopWarning}>
        <h1>📱 Please switch to a mobile device.</h1>
        <p>This experience is designed for smaller screens.</p>
      </div>
    );
  }

  return <div className={styles.container}>{children}</div>;
};

export default MobileGuard;