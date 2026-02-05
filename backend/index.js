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
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const path=require("path")
app.use(cors({ origin: '*' }));app.use(express.json());
const buildPath = path.join(__dirname, '../client/build');
app.use(express.static(buildPath));

// 3. The "Catch-All" Route (Critical for React Router)
// This fixes the "404 Not Found" error when you refresh the page on /chat or /profile

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/confessions', confessionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.get('/{any}', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});
// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ DB Error:', err));

const PORT = process.env.PORT || 5000;

// 1. Capture the HTTP server instance
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// 2. Initialize WebSocket Server
const wss = new WebSocketServer({ server });

// CHANGED: Use a Set to allow multiple connections (tabs/components) per user
const clients = new Map(); // Key: userId, Value: Set<WebSocket>

wss.on('connection', (ws, req) => {
  console.log('🔌 New Client Connected');

  ws.on('message', async (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      const { type, senderId, receiverId, text } = parsedMessage;

      if (type === 'register') {
        // Add to the Set of sockets for this user
        if (!clients.has(senderId)) {
          clients.set(senderId, new Set());
        }
        clients.get(senderId).add(ws);
        
        // Tag the socket with the userId for cleanup later
        ws.userId = senderId;
        return;
      }

      if (type === 'message') {
        const newMessage = new Message({ senderId, receiverId, text });
        await newMessage.save();

        // 1. Send to ALL of Receiver's active sockets
        const receiverSockets = clients.get(receiverId);
        if (receiverSockets) {
          const payload = JSON.stringify({
            senderId,
            text,
            timestamp: newMessage.timestamp
          });
          receiverSockets.forEach(socket => {
            if (socket.readyState === 1) {
              socket.send(payload);
            }
          });
        }

        // 2. Send confirmation to the Sender's specific socket (that sent this)
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
    // Cleanup: Remove this specific socket from the user's Set
    if (ws.userId && clients.has(ws.userId)) {
      const userSockets = clients.get(ws.userId);
      userSockets.delete(ws);
      if (userSockets.size === 0) {
        clients.delete(ws.userId);
      }
    }
  });
});