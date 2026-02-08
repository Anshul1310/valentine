// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require("path");
const { WebSocketServer } = require('ws'); 
require('dotenv').config();

// Models
const Message = require('./models/Message'); 

// Routes
const authRoutes = require('./routes/authRoutes');
const confessionRoutes = require('./routes/confessionRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// --- Middleware ---
app.use(cors({ origin: '*' }));
app.use(express.json());

// --- Static Files (React Build) ---
const buildPath = path.join(__dirname, '../client/build');
app.use(express.static(buildPath));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/confessions', confessionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);

// --- Catch-All Route for React Router ---
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ DB Error:', err));

const PORT = process.env.PORT || 5000;

// 1. Capture the HTTP server instance
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// 2. Initialize WebSocket Server
const wss = new WebSocketServer({ server });

// Client Tracking: Key = userId, Value = Set of WebSockets (for multiple tabs)
const clients = new Map(); 

wss.on('connection', (ws, req) => {
  console.log('🔌 New Client Connected');

  ws.on('message', async (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      const { type, senderId, receiverId, text } = parsedMessage;

      // --- REGISTER USER ---
      if (type === 'register') {
        if (!clients.has(senderId)) {
          clients.set(senderId, new Set());
        }
        clients.get(senderId).add(ws);
        
        // Tag the socket for cleanup
        ws.userId = senderId;
        return;
      }

      // --- HANDLE MESSAGE ---
      if (type === 'message') {
        // 1. SAVE TO DATABASE (Crucial Step)
        const newMessage = new Message({ 
          senderId, 
          receiverId, 
          text,
          timestamp: new Date() 
        });
        
        await newMessage.save();
        console.log(`💾 Message saved: ${newMessage._id} from ${senderId}`);

        // 2. SEND TO RECEIVER (if online)
        if (clients.has(receiverId)) {
          const receiverSockets = clients.get(receiverId);
          const payload = JSON.stringify({
            senderId,
            text,
            timestamp: newMessage.timestamp,
            isSelf: false
          });
          
          receiverSockets.forEach(socket => {
            if (socket.readyState === 1) { // WebSocket.OPEN
              socket.send(payload);
            }
          });
        }

        // 3. SEND CONFIRMATION TO SENDER (for UI updates)
        if (ws.readyState === 1) {
            ws.send(JSON.stringify({
              senderId,
              text,
              timestamp: newMessage.timestamp,
              isSelf: true 
            }));
        }
      }
    } catch (error) {
      console.error('WebSocket Error:', error);
    }
  });

  ws.on('close', () => {
    // Cleanup: Remove this socket from the user's Set
    if (ws.userId && clients.has(ws.userId)) {
      const userSockets = clients.get(ws.userId);
      userSockets.delete(ws);
      if (userSockets.size === 0) {
        clients.delete(ws.userId);
      }
    }
  });
});