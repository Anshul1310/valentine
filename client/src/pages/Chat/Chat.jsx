// client/src/pages/Chat/Chat.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from './Chat.module.css';

// --- Dynamic WebSocket URL ---
const WS_URL = process.env.REACT_APP_WS_URL || 'wss://benchbae.in';

const formatDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0); 
  
  // Ref for the specific scrollable container
  const chatContainerRef = useRef(null);
  const mainContainerRef = useRef(null);
  const ws = useRef(null); 
  const isFetchingRef = useRef(false);
  // kept for structure, but we won't scroll to it directly anymore
  const messagesEndRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const targetUser = location.state?.chatUser;

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

  const currentUserId = getCurrentUserId();
  const chatUserId = targetUser?._id; 

  const getAvatarUrl = () => {
    if (targetUser?.avatar) return targetUser.avatar;
    return `https://api.dicebear.com/9.x/adventurer/svg?seed=${targetUser?.name || 'User'}&flip=true`;
  };

  const chatUserDisplay = {
    name: targetUser?.name || "Unknown",
    status: "Online",
    avatar: getAvatarUrl()
  };

  // --- CRITICAL FIX: Use scrollTop instead of scrollIntoView ---
  const scrollToBottom = (behavior = "auto") => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      // Scroll strictly within this container, never affecting the parent window
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: behavior
      });
    }
  };

  const fetchHistory = useCallback(async (beforeTimestamp = null) => {
    if (!currentUserId || !chatUserId || isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      let url = `/api/chat/history/${currentUserId}/${chatUserId}`;
      if (beforeTimestamp) {
        url += `?before=${beforeTimestamp}`;
      }

      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const fetchedMessages = data.messages || [];
      const count = data.unreadCount || 0;

      if (fetchedMessages.length < 20) {
        setHasMore(false);
      }

      const formattedMessages = fetchedMessages.map(msg => ({
        id: msg._id,
        text: msg.text,
        sender: msg.senderId === currentUserId ? "me" : "them",
        timestamp: msg.timestamp,
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(msg.timestamp).toDateString()
      }));

      if (!beforeTimestamp) {
        setMessages(formattedMessages);
        setUnreadCount(count);
        // Small delay to ensure DOM is rendered before scrolling
        setTimeout(() => scrollToBottom("auto"), 100);
      } else {
        const container = chatContainerRef.current;
        const previousScrollHeight = container.scrollHeight;

        setMessages(prev => [...formattedMessages, ...prev]);

        requestAnimationFrame(() => {
            if(container) {
                container.scrollTop = container.scrollHeight - previousScrollHeight;
            }
        });
      }

    } catch (error) {
      console.error("Failed to load chat history", error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [currentUserId, chatUserId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleScroll = async () => {
    const container = chatContainerRef.current;
    if (!container) return;
    if (container.scrollTop === 0 && hasMore && !loading && !isFetchingRef.current) {
        const oldestMessage = messages[0];
        if (oldestMessage) {
            await fetchHistory(oldestMessage.timestamp);
        }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (!mainContainerRef.current) return;
      const visualHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      mainContainerRef.current.style.height = `${visualHeight}px`;
      
      if (chatContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
          const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50; // Added small buffer
          if(isAtBottom) scrollToBottom("auto");
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
      handleResize(); 
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  // --- WebSocket Logic ---
  useEffect(() => {
    if (!chatUserId || !currentUserId) return;

    ws.current = new WebSocket(WS_URL);
    
    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({ type: 'register', senderId: currentUserId }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const isSelf = (data.senderId === currentUserId);
      if (isSelf) return; 

      const newMessage = {
        id: Date.now(),
        text: data.text,
        sender: "them",
        timestamp: data.timestamp,
        time: new Date(data.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(data.timestamp || Date.now()).toDateString()
      };

      setMessages(prev => [...prev, newMessage]);
      setTimeout(() => scrollToBottom("smooth"), 100);
    };

    return () => { if (ws.current) ws.current.close(); };
  }, [currentUserId, chatUserId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUserId) return;

    const timestamp = Date.now();
    const textToSend = inputText;
    
    const tempMessage = {
      id: timestamp,
      text: textToSend,
      sender: "me",
      timestamp: timestamp,
      time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(timestamp).toDateString()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setInputText("");
    setUnreadCount(0);
    
    setTimeout(() => scrollToBottom("smooth"), 50);

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'message',
        senderId: currentUserId,
        receiverId: chatUserId,
        text: textToSend
      }));
    }
  };

  const renderMessages = () => {
    let lastDate = null;
    return messages.map((msg, index) => {
      const showDate = msg.date !== lastDate;
      lastDate = msg.date;
      
      return (
        <div key={msg.id || index}>
          {showDate && <div className={styles.dateSeparator}>{formatDate(msg.timestamp)}</div>}
          <div className={`${styles.messageRow} ${msg.sender === 'me' ? styles.sent : styles.received}`}>
            <div className={styles.bubble}>
              {msg.text}
              <span className={styles.timestamp}>{msg.time}</span>
            </div>
          </div>
        </div>
      );
    });
  };

  if (!targetUser) return <div>Loading...</div>;

  return (
    <div className={styles.container} ref={mainContainerRef}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
             <span style={{fontSize:'24px'}}>←</span>
        </button>
        <div className={styles.headerInfo}>
          <img src={chatUserDisplay.avatar} alt="Avatar" className={styles.avatar} />
          <div className={styles.nameCol}>
            <span className={styles.name}>{chatUserDisplay.name}</span>
            <span className={styles.status}><div className={styles.statusDot} /> Online</span>
          </div>
        </div>
      </div>

      {unreadCount > 0 && (
        <div style={{
            backgroundColor: '#ffebf0', 
            color: '#ff4b6e', 
            textAlign: 'center', 
            fontSize: '12px', 
            padding: '8px',
            fontWeight: '600',
            borderBottom: '1px solid #ffcad4'
        }}>
            {unreadCount} Unread Messages
        </div>
      )}

      <div 
        className={styles.messageList} 
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {loading && hasMore && <div className={styles.loadingHistory}>Loading history...</div>}
        {renderMessages()}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.footer} onSubmit={handleSend}>
        <input 
          className={styles.inputField}
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onFocus={() => setTimeout(() => scrollToBottom("smooth"), 300)}
        />
        <button type="submit" className={styles.sendBtn} disabled={!inputText.trim()}>
          ➤
        </button>
      </form>
    </div>
  );
};

export default Chat;