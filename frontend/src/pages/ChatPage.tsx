import ChatHistory from "../components/ChatHistory";

const ChatPage: React.FC = () => {
  const sessionId = "default"; // hoặc lấy từ route params

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2>Trang Chat</h2>
      <ChatHistory sessionId={sessionId} />
    </div>
  );
};

export default ChatPage;
