import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';
// const API_URL = 'https://3bqnn8dw-5000.asse.devtunnels.ms/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => {
    const savedId = localStorage.getItem('sessionId');
    if (savedId) return savedId;

    const newId = 'session_' + Date.now();
    localStorage.setItem('sessionId', newId);
    return newId;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🗂️ Load lịch sử chat khi mở trang
  useEffect(() => {
    console.log(11111);
    
    const fetchChatHistory = async () => {
      try {
        const res = await axios.get(`${API_URL}/chat/${sessionId}`);
        console.log(res, 222);
        
        if (res.data.success) {
          setMessages(res.data.chats.map((c: any) => ({
            role: c.role,
            content: c.content
          })));
        }
      } catch (err) {
        console.error('Lỗi load lịch sử chat:', err);
      }
    };

    fetchChatHistory();
  }, [sessionId]);

  // Gửi tin nhắn
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Thêm tin nhắn người dùng vào UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Gọi API backend
      const response = await axios.post(`${API_URL}/chat`, {
        message: userMessage,
        sessionId: sessionId
      });

      // Thêm phản hồi AI vào UI
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.data.message }
      ]);
    } catch (error: any) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Lỗi: ' + (error.response?.data?.error || 'Không thể kết nối server')
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Reset chat
  const resetChat = async () => {
    try {
      await axios.post(`${API_URL}/reset`, { sessionId });
      setMessages([]);
    } catch (error) {
      console.error('Error resetting chat:', error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>🤖 AI Chatbot</h1>
        <button onClick={resetChat} className="reset-btn">
          🔄 Reset
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>👋 Xin chào!</h2>
            <p>Tôi là trợ lý AI. Hãy hỏi tôi bất cứ điều gì!</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text">{msg.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu hỏi của bạn..."
          disabled={loading}
          className="chat-input"
        />
        <button type="submit" disabled={loading || !input.trim()} className="send-btn">
          {loading ? '⏳' : '📤'}
        </button>
      </form>
    </div>
  );
}

export default App;