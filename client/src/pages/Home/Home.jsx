import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './Home.module.css';

// ... (imports remain the same) ...
import Messages from './Messages/Messages';
import Matches from "./Matches/Matches";
import Profile from './Profile/Profile';
import Invitations from './Invitations/Invitations';
import Confessions from './Confessions/Confessions';

import MessageIcon from './icons/message.svg';
import MatchesIcon from './icons/matches.svg';
import ProfileIcon from './icons/profile.svg';
import ConfessionIcon from './icons/confession.svg';
import InvitationIcon from './icons/invitation.svg';

const Home = () => {
  const [activeTab, setActiveTab] = useState('matches');
  const [hasNotification, setHasNotification] = useState(false);
  const ws = useRef(null);

  // ... (keep playPopSound, getCurrentUserId, and useEffects exactly as they are) ...
  // --- Browser-Native Pop Sound Utility ---
  const playPopSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const getCurrentUserId = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      return JSON.parse(jsonPayload).id;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const userId = getCurrentUserId();
    const token = localStorage.getItem('authToken');
    
    // --- WebSocket for Messages ---
    if (userId) {
      ws.current = new WebSocket('wss://benchbae.in');
      
      ws.current.onopen = () => {
        ws.current.send(JSON.stringify({ type: 'register', senderId: userId }));
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (!data.isSelf) {
          if (activeTab !== 'messages') {
            setHasNotification(true);
            playPopSound();
          }
        }
      };
    }

    // --- Polling for Matches ---
    const checkMatches = async () => {
      if (!token) return;
      try {
        const res = await axios.get('/api/user/matches', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const currentMatches = res.data.matches?.length || 0;
        const seenMatches = parseInt(localStorage.getItem('seenMatches') || '0');

        if (currentMatches > seenMatches) {
          setHasNotification(true);
          playPopSound();
        }
      } catch (error) {
        console.error("Error checking activity", error);
      }
    };

    checkMatches();
    const interval = setInterval(checkMatches, 10000); 

    return () => {
      clearInterval(interval);
      if (ws.current) ws.current.close();
    };
  }, [activeTab]); 

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'messages') {
      setHasNotification(false);
      // ... same logic
      const token = localStorage.getItem('authToken');
      if (token) {
        axios.get('/api/user/matches', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            localStorage.setItem('seenMatches', res.data.matches?.length || 0);
        });
      }
    }
  };

  // Removed inline styles for icons to let CSS handle sizing
  const tabs = [
    { id: 'messages', label: 'Messages', icon: <img src={MessageIcon} alt="Messages" /> },
    { id: 'invitations', label: 'Invitations', icon: <img src={InvitationIcon} alt="Invitations" /> },
    { id: 'matches', label: 'Matches', icon: <img src={MatchesIcon} alt="Matches" />  },
    { id: 'confessions', label: 'Confessions', icon: <img src={ConfessionIcon} alt="Confessions" />  },
    { id: 'profile', label: 'Profile', icon: <img src={ProfileIcon} alt="Profile" />  }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'messages': return <Messages />;
      case 'invitations': return <Invitations />;
      case 'matches': return <Matches />;
      case 'confessions': return <Confessions />;
      case 'profile': return <Profile />;
      default: return <Matches />;
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.content}>
        {renderContent()}
      </main>

      <nav className={styles.bottomNav}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${styles.navItem} ${activeTab === tab.id ? styles.activeNavItem : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {/* Notification Dot REMOVED */}
            
            {/* Added iconContainer for the pill background effect */}
            <div className={styles.iconContainer}>
              <span className={styles.icon}>{tab.icon}</span>
            </div>
            
            <span className={styles.label}>{tab.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Home;