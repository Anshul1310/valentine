// src/pages/Home/Home.jsx
import { useState } from 'react';
import styles from './Home.module.css';
import Messages from './Messages/Messages';
import Matches from "./Matches/Matches"
import Profile from './Profile/Profile';
import Invitations from './Invitations/Invitations';
import Confessions from './Confessions/Confessions';
// Placeholder sub-components for each tab

const Home = () => {
  const [activeTab, setActiveTab] = useState('matches');

  // Tab configuration
  const tabs = [
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'invitations', label: 'Invitations', icon: '💌' },
    { id: 'matches', label: 'Matches', icon: '🔥' },
    { id: 'confessions', label: 'Confessions', icon: '🤫' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  // Render content based on active tab
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
      
      {/* Main Dynamic Content Area */}
      <main className={styles.content}>
        {renderContent()}
      </main>

      {/* Bottom Navigation Bar */}
      
      <nav className={styles.bottomNav}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${styles.navItem} ${activeTab === tab.id ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={styles.icon}>{tab.icon}</span>
            <span className={styles.label}>{tab.label}</span>
          </div>
        ))}
      </nav>

    </div>
  );
};

export default Home;