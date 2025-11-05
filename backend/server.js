const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ---------------------------
// KẾT NỐI MONGODB
// ---------------------------
console.log('🔍 MongoDB URI:', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ---------------------------
// ĐỊNH NGHĨA SCHEMA & MODEL
// ---------------------------
const chatSchema = new mongoose.Schema({
  sessionId: String,
  role: String,        // 'user' hoặc 'assistant'
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);


// Khởi tạo Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Lưu lịch sử chat cho mỗi session (trong production nên dùng database)
const chatSessions = {};

// API endpoint để chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Khởi tạo session mới nếu chưa có
    if (!chatSessions[sessionId]) {
      chatSessions[sessionId] = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Always respond in the same language as the user\'s question.'
        }
      ];
    }

    // Thêm tin nhắn người dùng vào lịch sử
    chatSessions[sessionId].push({
      role: 'user',
      content: message
    });

    // Gọi Groq API
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: chatSessions[sessionId],
      temperature: 0.7,
      max_tokens: 1024
    });

    const aiResponse = completion.choices[0].message.content;

    // Lưu phản hồi AI vào lịch sử
    chatSessions[sessionId].push({
      role: 'assistant',
      content: aiResponse
    });

    // 🔹 Lưu tin nhắn người dùng vào DB
    await Chat.create({
      sessionId,
      role: 'user',
      content: message
    });

    // 🔹 Lưu phản hồi AI vào DB
    await Chat.create({
      sessionId,
      role: 'assistant',
      content: aiResponse
    });

    // Trả về response
    res.json({
      success: true,
      message: aiResponse,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ---------------------------
// API: LẤY LỊCH SỬ CHAT
// ---------------------------
app.get('/api/chat/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const chats = await Chat.find({ sessionId }).sort({ createdAt: 1 });
    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API endpoint để reset chat
app.post('/api/reset', (req, res) => {
  const { sessionId = 'default' } = req.body;
  delete chatSessions[sessionId];
  res.json({ success: true, message: 'Chat history cleared' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});