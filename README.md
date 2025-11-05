# 🤖 AI Chatbot (React + Node.js + MongoDB + GROQ)

A lightweight AI chatbot web app built with React and Node.js.  
Messages are saved in MongoDB and loaded by session for persistent chat history.

---

## 🚀 Features

- Chat with AI using GROQ API
- Save and load chat history by session
- Reset or start new chat
- Built with React (Vite) + Express + MongoDB

---

## ⚙️ Setup

### 1️⃣ Backend

```bash
cd backend
npm install
```

Create `.env`:

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/chatdb
GROQ_API_KEY=your_groq_api_key
```

Start server:

```bash
npm start
```

### 2️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔌 API

| Method | Endpoint               | Description                 |
| ------ | ---------------------- | --------------------------- |
| POST   | `/api/chat`            | Send message & get AI reply |
| GET    | `/api/chat/:sessionId` | Get chat history            |
| POST   | `/api/reset`           | Reset session chat          |

---

## 🧠 Tech Stack

- React + TypeScript + Vite
- Node.js + Express
- MongoDB + Mongoose
- GROQ API

---

## 👨‍💻 Author

**Ha Nguyen (Elkun310)** – Japan 🇯🇵  
MIT License
