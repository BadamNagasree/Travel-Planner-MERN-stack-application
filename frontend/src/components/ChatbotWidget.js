import React, { useState } from "react";
import "../styles/ChatbotWidget.css";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Welcome to TravelAI assistant. Enter your travel query to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate smart bot response based on user input keywords
    setTimeout(() => {
      let replyText = "I can assist you with budget, packing lists, or popular locations. Try asking about 'budget' or 'packing'.";
      const textLower = userMessage.text.toLowerCase();

      if (textLower.includes("budget") || textLower.includes("cost") || textLower.includes("cheap")) {
        replyText = "Budget recommendations: Consider traveling off-season, booking flights on mid-week days, and opting for local street food culinary highlights which are highly cost-efficient.";
      } else if (textLower.includes("pack") || textLower.includes("wear") || textLower.includes("bring")) {
        replyText = "Packing checklist: Ensure you carry a universal adapter, portable power bank, reusable container, comfortable walking footwear, and secure copies of identification documents.";
      } else if (textLower.includes("hello") || textLower.includes("hi") || textLower.includes("hey")) {
        replyText = "Hello. How can I assist you with your destination planning today?";
      } else if (textLower.includes("destinations") || textLower.includes("places") || textLower.includes("where")) {
        replyText = "Recommended locations: Kyoto (Japan) for historical sights, Amalfi Coast (Italy) for coastal scenery, and Cape Town (South Africa) for outdoor activities.";
      } else if (textLower.includes("hotel") || textLower.includes("stay") || textLower.includes("book")) {
        replyText = "Lodging guidelines: Boutique guesthouses or highly rated central business hotels offer optimal transit accessibility and amenities.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: replyText,
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="chatbot-widget">
      {/* Floating Chat Trigger Button */}
      <button className="chat-trigger" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "Close" : "Support"}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>TravelAI Support</h3>
            <span className="online-indicator">Active</span>
          </div>

          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            {isTyping && (
              <div className="message-bubble bot typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}
          </div>

          <form className="chat-input-form" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Enter your query..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}
