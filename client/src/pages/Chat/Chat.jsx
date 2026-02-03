// src/pages/Home/Chat/Chat.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Chat.module.css';

const INITIAL_MESSAGES = [
  { id: 1, text: "Hey! I saw you like hiking too? 🏔️", sender: "them", time: "10:00 AM" },
  { id: 2, text: "Yeah! I go to the hills every weekend.", sender: "me", time: "10:05 AM" },
  { id: 3, text: "That's awesome. Have you tried the northern trail?", sender: "them", time: "10:06 AM" },
];

const Chat = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Mock User Data (The person you are chatting with)
  const chatUser = {
    name: "Sanya",
    status: "Online",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Sanya&flip=true"
  };

  // Auto-scroll to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // Simulate a reply after 2 seconds for fun
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        text: "That sounds super cool! Let's plan something? 😊",
        sender: "them",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, reply]);
    }, 2000);
  };

  return (
    <div className={styles.container}>
      
      {/* 1. Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ←
        </button>
        <div className={styles.headerInfo}>
          <img src={chatUser.avatar} alt="Avatar" className={styles.avatar} />
          <div className={styles.nameCol}>
            <span className={styles.name}>{chatUser.name}</span>
            <span className={styles.status}>
              <div className={styles.statusDot} /> {chatUser.status}
            </span>
          </div>
        </div>
        <div style={{ fontSize: '20px' }}>⋮</div>
      </div>

      {/* 2. Message List */}
      <div className={styles.messageList}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`${styles.messageRow} ${msg.sender === 'me' ? styles.sent : styles.received}`}
          >
            <div className={styles.bubble}>
              {msg.text}
              <span className={styles.timestamp}>{msg.time}</span>
            </div>
          </div>
        ))}
        {/* Invisible div to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Footer */}
      <form className={styles.footer} onSubmit={handleSend}>
        <input 
          className={styles.inputField}
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className={styles.sendBtn}>
          ➤
        </button>
      </form>

    </div>
  );
};

export default Chat;