import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './Home.module.css';
import Messages from './Messages/Messages';
import Matches from "./Matches/Matches";
import Profile from './Profile/Profile';
import Invitations from './Invitations/Invitations';
import Confessions from './Confessions/Confessions';

const Home = () => {
  const [activeTab, setActiveTab] = useState('matches');
  const [hasNotification, setHasNotification] = useState(false);
  const ws = useRef(null);

  // Helper to get User ID
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

  // 1. WebSocket & Polling Logic
  useEffect(() => {
    const userId = getCurrentUserId();
    const token = localStorage.getItem('authToken');
    
    // --- A. WebSocket for Real-time Messages ---
    if (userId) {
      ws.current = new WebSocket('ws://localhost:5000');
      
      ws.current.onopen = () => {
        // Register this "Home" connection
        ws.current.send(JSON.stringify({ type: 'register', senderId: userId }));
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // If it's a message from someone else
        if (!data.isSelf) {
          // Only show dot if NOT currently on messages tab
          if (activeTab !== 'messages') {
            setHasNotification(true);
          }
        }
      };
    }

    // --- B. Polling for New Matches (Accepted Invites) ---
    const checkMatches = async () => {
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:5000/api/user/matches', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const currentMatches = res.data.matches?.length || 0;
        const seenMatches = parseInt(localStorage.getItem('seenMatches') || '0');

        if (currentMatches > seenMatches) {
          setHasNotification(true);
        }
      } catch (error) {
        console.error("Error checking activity", error);
      }
    };

    checkMatches();
    const interval = setInterval(checkMatches, 10000); // Check every 10s

    return () => {
      clearInterval(interval);
      if (ws.current) ws.current.close();
    };
  }, [activeTab]); // Re-run if activeTab changes to ensure logic allows/blocks dot

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Clear notification when entering Messages
    if (tabId === 'messages') {
      setHasNotification(false);
      
      // Update "seen" count
      const token = localStorage.getItem('authToken');
      if (token) {
        axios.get('http://localhost:5000/api/user/matches', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            localStorage.setItem('seenMatches', res.data.matches?.length || 0);
        });
      }
    }
  };

  const tabs = [
    { id: 'messages', label: 'Messages', icon: '💬' }, // Dot will appear here
    { id: 'invitations', label: 'Invitations', icon: '💌' },
    { id: 'matches', label: 'Matches', icon: '🔥' },
    { id: 'confessions', label: 'Confessions', icon: '🤫' },
    { id: 'profile', label: 'Profile', icon: '👤' }
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
            {/* The Red Dot Notification */}
            {tab.id === 'messages' && hasNotification && activeTab !== 'messages' && (
              <span className={styles.notificationDot} />
            )}

            <span className={styles.icon}>{tab.icon}</span>
            <span className={styles.label}>{tab.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Home;