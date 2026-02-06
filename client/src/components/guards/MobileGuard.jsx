import { useState, useEffect } from 'react';
import styles from './MobileGuard.module.css';

const MobileGuard = ({ children }) => {
  const checkIsMobile = () => {
    // 1. Standard check: Is the window narrow?
    const isNarrowWindow = window.innerWidth < 768;
    
    // 2. Device check: Is the PHYSICAL screen small? (Remains true on mobile even in Desktop Mode)
    const isSmallDevice = window.screen.width < 768;

    // 3. Touch check: Does it have touch points? (Most desktops don't)
    const isTouchDevice = navigator.maxTouchPoints > 0;

    // Pass if ANY of these are true. 
    // This allows "Desktop Mode" on mobile to still render the app.
    return isNarrowWindow || isSmallDevice || isTouchDevice;
  };

  const [isMobile, setIsMobile] = useState(checkIsMobile());

  useEffect(() => {
    const handleResize = () => setIsMobile(checkIsMobile());
    window.addEventListener('resize', handleResize);
    
    // Check again on load just in case
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile) {
    return (
      <div className={styles.desktopWarning}>
        <h1>📱 Please switch to a mobile device.</h1>
        <p>This experience is designed for smaller screens.</p>
        {/* Fallback button in case detection still fails */}
        <button 
          onClick={() => setIsMobile(true)}
          style={{ 
            marginTop: '1rem', 
            padding: '10px 20px', 
            background: '#ff4b6e', 
            color: 'white', 
            border: 'none', 
            borderRadius: '24px',
            fontWeight: '600'
          }}
        >
          I'm on Mobile (Continue)
        </button>
      </div>
    );
  }

  return <div className={styles.container}>{children}</div>;
};

export default MobileGuard;