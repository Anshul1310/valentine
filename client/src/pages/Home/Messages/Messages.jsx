// src/pages/Home/Messages/Messages.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Messages.module.css';

const Messages = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem('authToken');
        // Fetch matches from the backend
        const { data } = await axios.get('/api/user/matches', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Use the 'matches' array from the response
        setMatches(data.matches || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleChatClick = (user) => {
    // Navigate to Chat page and pass the user details
    navigate('/chat', { state: { chatUser: user } });
  };

  // Helper to generate dynamic avatars
  const getAvatar = (name) => {
    const seed = name || 'User';
    return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&flip=true`;
  };

  if (loading) return <div className={styles.container}><p style={{padding:'20px'}}>Loading chats...</p></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Messages</h2>
        
        {/* Horizontal Stories - Showing Matches */}
        
      </div>

      {/* Vertical Chat List */}
      <div className={styles.chatList}>
        {matches.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>
            No matches yet. <br/> Go to Home to invite people! 💘
          </p>
        ) : (
          matches.map((user) => (
            <div 
              key={user._id} 
              className={styles.chatItem} 
              onClick={() => handleChatClick(user)}
            >
              <img 
                src={getAvatar(user.name)} 
                alt={user.name} 
                className={styles.chatAvatar} 
              />
              <div className={styles.chatInfo}>
                <div className={styles.chatHeader}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.time}>Now</span>
                </div>
                <div className={styles.lastMessage}>
                  <span className={styles.msgText}>Tap to start chatting! 👋</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Messages;