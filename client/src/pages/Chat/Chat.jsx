import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from './Chat.module.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const mainContainerRef = useRef(null);
  const ws = useRef(null); 
  
  const navigate = useNavigate();
  const location = useLocation();
  const targetUser = location.state?.chatUser;

  // --- Auth Logic ---
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

  const chatUserDisplay = {
    name: targetUser?.name || "Unknown",
    status: "Online",
    avatar: `https://api.dicebear.com/9.x/adventurer/svg?seed=${targetUser?.name || 'User'}&flip=true`
  };

  // --- Sound Logic ---
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

  // --- History Logic ---
  const fetchHistory = useCallback(async (beforeTimestamp = null) => {
    if (!currentUserId || !chatUserId) return;
    
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

      if (data.length < 20) {
        setHasMore(false);
      }

      const formattedMessages = data.map(msg => ({
        id: msg._id,
        text: msg.text,
        sender: msg.senderId === currentUserId ? "me" : "them",
        timestamp: msg.timestamp,
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      setMessages(prev => {
        if (!beforeTimestamp) {
          return formattedMessages;
        } else {
          return [...formattedMessages, ...prev];
        }
      });

    } catch (error) {
      console.error("Failed to load chat history", error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, chatUserId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (!loading && messages.length <= 20) {
         messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages.length, loading]); 

  // --- KEYBOARD FIX: Visual Viewport Handler ---
  useEffect(() => {
    const handleResize = () => {
      if (!mainContainerRef.current) return;
      
      // 1. Get the actual visible height (Screen Height - Keyboard Height)
      const visualHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      
      // 2. Force the container to match this height exactly
      mainContainerRef.current.style.height = `${visualHeight}px`;

      // 3. Fix scroll offset of the page body
      window.scrollTo(0, 0); 

      // 4. Force messages to bottom immediately so they aren't hidden
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize); // Handle scroll events too
      handleResize(); // Initialize
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

    ws.current = new WebSocket('wss://benchbae.in');
    
    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({ type: 'register', senderId: currentUserId }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const isSelf = (data.isSelf || data.senderId === currentUserId);
      
      const newMessage = {
        id: Date.now(),
        text: data.text,
        sender: isSelf ? "me" : "them",
        timestamp: data.timestamp,
        time: new Date(data.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newMessage]);
      
      if (!isSelf) {
        playPopSound();
      }

      setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };

    return () => { if (ws.current) ws.current.close(); };
  }, [currentUserId, chatUserId]);

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
    
    // Scroll to bottom immediately
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleScroll = async () => {
    const container = chatContainerRef.current;
    if (!container) return;
    if (container.scrollTop === 0 && hasMore && !loading) {
      const oldScrollHeight = container.scrollHeight;
      const oldestMessage = messages[0];
      if (oldestMessage) {
        await fetchHistory(oldestMessage.timestamp);
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight - oldScrollHeight;
        });
      }
    }
  };

  if (!targetUser) return <div>Loading...</div>;

  return (
    <div className={styles.container} ref={mainContainerRef}>
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

      <div 
        className={styles.messageList} 
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
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

      <form className={styles.footer} onSubmit={handleSend}>
        <input 
          className={styles.inputField}
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onFocus={() => {
             // Delay to allow keyboard animation to finish, then scroll
             setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
          }}
        />
        <button type="submit" className={styles.sendBtn}>➤</button>
      </form>
    </div>
  );
};

export default Chat;