// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { WebSocketServer } = require('ws'); 
const Message = require('./models/Message'); 
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const confessionRoutes = require('./routes/confessionRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes'); // <--- IMPORT THIS

const app = express();

app.use(cors({ origin: 'http://localhost:3000' })); 
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/confessions', confessionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes); // <--- USE THIS

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ DB Error:', err));

const PORT = process.env.PORT || 5000;

// 1. Capture the HTTP server instance
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// 2. Initialize WebSocket Server
const wss = new WebSocketServer({ server });
const clients = new Map();

wss.on('connection', (ws, req) => {
  console.log('🔌 New Client Connected');

  ws.on('message', async (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      const { type, senderId, receiverId, text } = parsedMessage;

      if (type === 'register') {
        clients.set(senderId, ws);
        return;
      }

      if (type === 'message') {
        const newMessage = new Message({ senderId, receiverId, text });
        await newMessage.save();

        const receiverSocket = clients.get(receiverId);
        if (receiverSocket && receiverSocket.readyState === 1) { 
          receiverSocket.send(JSON.stringify({
            senderId,
            text,
            timestamp: newMessage.timestamp
          }));
        }

        ws.send(JSON.stringify({
          senderId,
          text,
          timestamp: newMessage.timestamp,
          isSelf: true 
        }));
      }
    } catch (error) {
      console.error('WebSocket Error:', error);
    }
  });

  ws.on('close', () => {
    for (const [userId, socket] of clients.entries()) {
      if (socket === ws) {
        clients.delete(userId);
        break;
      }
    }
  });
});