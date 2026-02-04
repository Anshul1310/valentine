// src/pages/Chat/Chat.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from './Chat.module.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Is there more history?
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null); // Ref for the scrollable container
  const ws = useRef(null); 
  
  const navigate = useNavigate();
  const location = useLocation();
  const targetUser = location.state?.chatUser;

  // --- Auth Helper ---
  const getCurrentUserId = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload).id;
    } catch (error) {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();
  const chatUserId = targetUser?._id; 

  const chatUserDisplay = {
    name: targetUser?.name || "Unknown",
    status: "Online",
    avatar: `https://api.dicebear.com/9.x/adventurer/svg?seed=${targetUser?.name || 'User'}&flip=true`
  };

  // --- 1. Fetch History Function ---
  const fetchHistory = useCallback(async (beforeTimestamp = null) => {
    if (!currentUserId || !chatUserId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      let url = `http://localhost:5000/api/chat/history/${currentUserId}/${chatUserId}`;
      if (beforeTimestamp) {
        url += `?before=${beforeTimestamp}`;
      }

      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.length < 20) {
        setHasMore(false); // No more messages to load
      }

      const formattedMessages = data.map(msg => ({
        id: msg._id,
        text: msg.text,
        sender: msg.senderId === currentUserId ? "me" : "them",
        timestamp: msg.timestamp, // Keep raw timestamp for cursor
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      setMessages(prev => {
        if (!beforeTimestamp) {
          // Initial load: Replace all
          return formattedMessages;
        } else {
          // Load more: Prepend to top
          return [...formattedMessages, ...prev];
        }
      });

    } catch (error) {
      console.error("Failed to load chat history", error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, chatUserId]);

  // --- 2. Initial Load ---
  useEffect(() => {
    fetchHistory(); // Load first 20
  }, [fetchHistory]);

  // --- 3. Scroll to Bottom on Initial Load / New Message ---
  useEffect(() => {
    // Only auto-scroll if we are at the bottom OR it's the initial load (messages small)
    // We check if we just loaded 'old' messages by comparing length, 
    // but simpler approach: use a flag or check scroll position.
    // Here we use a simple heuristic: if we just sent a message (me) or it's short, scroll.
    if (!loading && messages.length <= 20) {
         messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages.length]); 

  // --- 4. Infinite Scroll Handler ---
  const handleScroll = async () => {
    const container = chatContainerRef.current;
    if (!container) return;

    // If scrolled to top (scrollTop === 0) and we have more messages
    if (container.scrollTop === 0 && hasMore && !loading) {
      const oldScrollHeight = container.scrollHeight;
      
      // Get timestamp of the OLDEST message (index 0)
      const oldestMessage = messages[0];
      if (oldestMessage) {
        await fetchHistory(oldestMessage.timestamp);
        
        // Restore Scroll Position:
        // New Height - Old Height = The amount of new content added. 
        // We set scrollTop to that amount to keep the user's view stable.
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight - oldScrollHeight;
        });
      }
    }
  };

  // --- 5. WebSocket Logic (Keep existing) ---
  useEffect(() => {
    if (!chatUserId || !currentUserId) return;
    ws.current = new WebSocket('ws://localhost:5000');
    
    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({ type: 'register', senderId: currentUserId }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newMessage = {
        id: Date.now(),
        text: data.text,
        sender: (data.isSelf || data.senderId === currentUserId) ? "me" : "them",
        timestamp: data.timestamp,
        time: new Date(data.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Auto-scroll to bottom on new message
      setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };

    return () => { if (ws.current) ws.current.close(); };
  }, [currentUserId, chatUserId]);

  // --- 6. Send Handler ---
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUserId) return;

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'message',
        senderId: currentUserId,
        receiverId: chatUserId,
        text: inputText
      }));
    }
    setInputText("");
  };

  if (!targetUser) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <div className={styles.headerInfo}>
          <img src={chatUserDisplay.avatar} alt="Avatar" className={styles.avatar} />
          <div className={styles.nameCol}>
            <span className={styles.name}>{chatUserDisplay.name}</span>
            <span className={styles.status}><div className={styles.statusDot} /> Online</span>
          </div>
        </div>
      </div>

      {/* Message List with Scroll Handler */}
      <div 
        className={styles.messageList} 
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {/* Loading Spinner at top */}
        {loading && hasMore && <div style={{textAlign:'center', fontSize:'12px', color:'#888'}}>Loading history...</div>}

        {messages.map((msg, index) => (
          <div key={msg.id || index} className={`${styles.messageRow} ${msg.sender === 'me' ? styles.sent : styles.received}`}>
            <div className={styles.bubble}>
              {msg.text}
              <span className={styles.timestamp}>{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <form className={styles.footer} onSubmit={handleSend}>
        <input 
          className={styles.inputField}
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className={styles.sendBtn}>➤</button>
      </form>
    </div>
  );
};

export default Chat;