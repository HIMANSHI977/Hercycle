
import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Heart,
  Leaf,
  Activity,
  RefreshCw,
  User,
  MessageCircle,
  AlertCircle
} from "lucide-react";

import API from "../services/api.js";
import "../styles/AIAssistant.css";

const suggestions = [
  {
    icon: Heart,
    title: "Period cramps",
    prompt: "What are some gentle ways to manage period cramps?"
  },
  {
    icon: Leaf,
    title: "Healthy foods",
    prompt: "What nutritious Indian foods can I eat during my period?"
  },
  {
    icon: Activity,
    title: "Yoga & exercise",
    prompt: "Which gentle yoga poses can help me feel more comfortable during my period?"
  },
  {
    icon: MessageCircle,
    title: "Cycle questions",
    prompt: "Can you explain the four phases of the menstrual cycle?"
  }
];

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hi! I'm your HerCycle wellness assistant. 💗 You can ask me about menstrual health, cycle phases, nutrition, gentle movement and self-care. What would you like to know?"
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, loading]);

  const sendMessage = async (event, suggestedMessage) => {
    event?.preventDefault();

    const message = (suggestedMessage ?? input).trim();

    if (!message || loading) return;

    if (message.length > 2000) {
      setError("Please keep your message under 2000 characters.");
      return;
    }

    setError("");
    setInput("");

    const updatedMessages = [
      ...messages,
      { role: "user", text: message }
    ];

    setMessages(updatedMessages);
    setLoading(true);

    try {
      const history = messages
        .filter((item) => item.role === "user" || item.role === "model")
        .slice(-10)
        .map((item) => ({
          role: item.role,
          text: item.text
        }));

      const response = await API.post("/ai/chat", {
        message,
        history
      });

      const reply = response.data?.reply;

      if (!reply) {
        throw new Error("The assistant returned an empty response.");
      }

      setMessages((previous) => [
        ...previous,
        { role: "model", text: reply }
      ]);
    } catch (err) {
      console.error("AI Assistant request failed:", err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to get a response. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    sendMessage(event);
  };

  const handleSuggestion = (prompt) => {
    sendMessage(null, prompt);
  };

  const clearChat = () => {
    if (loading) return;

    setMessages([
      {
        role: "model",
        text: "Hello again! 💗 What would you like to explore today?"
      }
    ]);

    setInput("");
    setError("");
  };

  return (
    <main className="ai-page">
      <header className="ai-header">
        <div>
          <span className="ai-eyebrow">
            <Sparkles size={14} />
            YOUR PERSONAL WELLNESS COMPANION
          </span>

          <h1>HerCycle AI Assistant</h1>

          <p>
            A supportive space for your menstrual health and
            everyday wellness questions.
          </p>
        </div>

        <button
          type="button"
          className="ai-clear-button"
          onClick={clearChat}
          disabled={loading}
        >
          <RefreshCw size={16} />
          New Chat
        </button>
      </header>

      <section className="ai-chat-card">
        <div className="ai-chat-topbar">
          <div className="ai-bot-avatar">
            <Bot size={23} />
          </div>

          <div className="ai-bot-details">
            <h2>HerCycle Assistant</h2>
            <span>
              <span className="ai-online-dot" />
              Here to support you
            </span>
          </div>

          <div className="ai-powered-label">
            <Sparkles size={14} />
            AI Powered
          </div>
        </div>

        <div className="ai-messages">
          {messages.map((message, index) => (
            <div
              className={`ai-message-row ${
                message.role === "user" ? "user-message-row" : ""
              }`}
              key={index}
            >
              {message.role === "model" && (
                <div className="ai-message-avatar assistant-avatar">
                  <Bot size={18} />
                </div>
              )}

              <div
                className={`ai-message-bubble ${
                  message.role === "user"
                    ? "user-bubble"
                    : "assistant-bubble"
                }`}
              >
                <p>{message.text}</p>
              </div>

              {message.role === "user" && (
                <div className="ai-message-avatar user-avatar">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="ai-message-row">
              <div className="ai-message-avatar assistant-avatar">
                <Bot size={18} />
              </div>

              <div className="ai-message-bubble assistant-bubble ai-typing">
                <span />
                <span />
                <span />
                <small>Thinking...</small>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="ai-error">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        <form className="ai-input-area" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              if (error) setError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit(event);
              }
            }}
            placeholder="Ask anything about your wellness..."
            rows={1}
            maxLength={2000}
            disabled={loading}
          />

          <button
            type="submit"
            className="ai-send-button"
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            <Send size={19} />
          </button>
        </form>

        <div className="ai-input-footer">
          <span>Press Enter to send · Shift + Enter for a new line</span>
          <span>{input.length}/2000</span>
        </div>
      </section>

      <section className="ai-suggestions-section">
        <div className="ai-suggestions-heading">
          <div>
            <span className="ai-eyebrow">NOT SURE WHERE TO START?</span>
            <h2>Explore a topic</h2>
          </div>
          <Sparkles size={21} />
        </div>

        <div className="ai-suggestions-grid">
          {suggestions.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                className="ai-suggestion-card"
                key={item.title}
                onClick={() => handleSuggestion(item.prompt)}
                disabled={loading}
              >
                <div className="ai-suggestion-icon">
                  <Icon size={20} />
                </div>

                <span>{item.title}</span>
                <p>{item.prompt}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="ai-safety-note">
        <Heart size={20} />
        <div>
          <h3>Your health matters</h3>
          <p>
            AI responses are for general educational support and
            are not a medical diagnosis. For severe, unusual or
            persistent symptoms, consult a qualified healthcare
            professional.
          </p>
        </div>
      </section>
    </main>
  );
};

export default AIAssistant;
