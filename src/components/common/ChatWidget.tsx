import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import ChatIcon from '@mui/icons-material/Chat';
import { showLoginRequired } from "../../components/common/CustomSwal";
import { useNavigate } from "react-router-dom";




interface User {
  name: string;
  email: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate();


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!user) {
      showLoginRequired("Please enter your name and email to start chatting",navigate);
    
      return;
    }

    const newMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

      
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [...messages, newMessage],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error?.message || "API request failed");
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "No response";

      const botReply: Message = { role: "assistant", content: reply };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      const errorReply: Message = { 
        role: "assistant", 
        content: `error: ${errorMessage}` 
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <>
      

      <button
        className="btn btn-success rounded-0 shadow position-fixed"
        style={{
          bottom: "25px",
          right: "25px",
          width: "55px",
          height: "55px",
          zIndex: 1050,
        }}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={22} /> : <ChatIcon />}
      </button>

      
      {open && (
        <div
          className="card shadow-lg position-fixed rounded-0"
          style={{
            bottom: "90px",
            right: "25px",
            width: "320px",
            zIndex: 1049,
          }}
        >
    
          <div
            className="card-header rounded-0 text-white d-flex justify-content-between align-items-center"
            style={{ backgroundColor: "#6b1e2f" }}
          >
            <h6 className="m-0">Roséa Assistant</h6>
            <small>{user ? `Hi, ${user.name}` : "Guest 💬"}</small>
          </div>

          <div className="card-body" style={{ fontSize: "14px" }}>
    
            
            
                <div
                  className="mb-3 p-2 border rounded"
                  style={{
                    height: "250px",
                    overflowY: "auto",
                    backgroundColor: "#fafafa",
                  }}
                >
                  {messages.length === 0 && (
                    <div className="text-center text-muted mt-5">
                      <small>Start chatting...</small>
                    </div>
                  )}
                  
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-2 mb-2 rounded ${
                        msg.role === "user"
                          ? "text-end"
                          : "bg-light text-dark"
                      }`}
                      style={{ 
                        fontSize: "13px",
                        backgroundColor: msg.role === "user" ? "#f0cfa0ff" : "#f1f1f1" 
                      }}
                    >
                      {msg.content}
                    </div>
                  ))}

                  {loading && (
                    <div className="text-muted small fst-italic">Typing...</div>
                  )}
                </div>

          
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-0"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
                    disabled={loading}
                  />
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ backgroundColor: "#6b1e2f" }}
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                  >
                    Send
                  </button>
                </div>
        
          
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;