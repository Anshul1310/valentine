// client/src/pages/Home/Messages/Messages.jsx
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
        const { data } = await axios.get('/api/user/matches', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
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
    // We pass the full user object (including their custom avatar) to the Chat screen
    navigate('/chat', { state: { chatUser: user } });
  };

  // UPDATED: Use the DB avatar if it exists, otherwise fallback to name-generation
  const getAvatar = (user) => {
    if (user.avatar) return user.avatar;
    const seed = user.name || 'User';
    return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&flip=true`;
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) return <div className={styles.container}><p style={{padding:'20px'}}>Loading chats...</p></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Messages</h2>
      </div>

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
                src={getAvatar(user)} 
                alt={user.name} 
                className={styles.chatAvatar} 
              />
              <div className={styles.chatInfo}>
                <div className={styles.chatHeader}>
                  <span className={styles.userName}>{user.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={styles.time}>{formatTime(user.lastMessageTime)}</span>
                  </div>
                </div>
                <div className={styles.lastMessage}>
                  <span className={styles.msgText}>
                    {user.lastMessage && user.lastMessage.length > 30 
                      ? user.lastMessage.substring(0, 30) + "..." 
                      : user.lastMessage}
                  </span>
                  
                  {/* UNREAD BADGE */}
                  {user.unreadCount > 0 && (
                    <span className={styles.unreadBadge}>
                      {user.unreadCount}
                    </span>
                  )}
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