// client/src/pages/Home/Home.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import styles from './Home.module.css';

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

// --- Dynamic WebSocket URL ---
// Uses .env variable if available, otherwise falls back to production
const WS_URL = process.env.REACT_APP_WS_URL || 'wss://benchbae.in';

const Home = () => {
  const [activeTab, setActiveTab] = useState('matches');
  const [unreadCount, setUnreadCount] = useState(0); 
  const ws = useRef(null);

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

  const fetchStatus = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const res = await axios.get('/api/user/matches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const matches = res.data.matches || [];
      const totalUnread = matches.reduce((sum, match) => sum + (match.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error("Error checking status", error);
    }
  }, []);

  useEffect(() => {
    const userId = getCurrentUserId();
    fetchStatus();

    // --- WebSocket Logic ---
    if (userId) {
      // Connect using the dynamic URL
      ws.current = new WebSocket(WS_URL);
      
      ws.current.onopen = () => {
        console.log(`Connected to WS at ${WS_URL}`);
        ws.current.send(JSON.stringify({ type: 'register', senderId: userId }));
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (!data.isSelf) {
            fetchStatus(); 
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      // Optional: Add simple reconnection logic
      ws.current.onclose = () => {
        console.log("WebSocket Disconnected");
      };
    }

    const interval = setInterval(fetchStatus, 10000); 

    return () => {
      clearInterval(interval);
      if (ws.current) ws.current.close();
    };
  }, [fetchStatus]); 

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'messages') {
        fetchStatus();
    }
  };

  const tabs = [
    { 
      id: 'messages', 
      label: 'Messages', 
      icon: <img src={MessageIcon} alt="Messages" />,
      badge: unreadCount 
    },
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
            <div className={styles.iconContainer}>
              <span className={styles.icon}>{tab.icon}</span>
              {tab.badge > 0 && (
                <div className={styles.badge}>
                  {tab.badge > 99 ? '99+' : tab.badge}
                </div>
              )}
            </div>
            <span className={styles.label}>{tab.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Home;