import { useEffect, useState } from "react";

interface ChatMessage {
  _id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface ChatHistoryProps {
  sessionId: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ sessionId }) => {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`/api/chat/${sessionId}`);
        const data = await res.json();

        if (data.success) {
          setChats(data.chats);
        } else {
          console.error("Error:", data.error);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [sessionId]);

  if (loading) return <p>Đang tải lịch sử chat...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h3>Lịch sử chat (Session: {sessionId})</h3>
      {chats.length === 0 ? (
        <p>Chưa có tin nhắn nào.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {chats.map((c) => (
            <li
              key={c._id}
              style={{
                marginBottom: "10px",
                textAlign: c.role === "user" ? "right" : "left",
              }}
            >
              <strong>{c.role === "user" ? "👤 Anh:" : "🤖 Bot:"}</strong>{" "}
              <span>{c.content}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatHistory;
