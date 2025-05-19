import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';
import './ChatWidget.css'; // Make sure to import the CSS

const initialMessage = [
  {
    id: 1,
    text: 'Hello! Welcome to ZeeCare Medical Institute. How can I assist you today?',
    sender: 'bot',
    timestamp: new Date().toISOString(),
  },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessage);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-open the chat widget when component mounts
  useEffect(() => {
    // Delay opening by 2 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const sendMessage = () => {
    if (newMessage.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setNewMessage('');

    // Simulate bot response
    setIsTyping(true);
    setTimeout(() => {
      const botResponses = [
        "Thanks for your message! Our medical team will review your inquiry.",
        "Good question! I recommend booking an appointment to discuss this with our specialists.",
        "I understand your concern. ZeeCare offers comprehensive care for this condition.",
        "We have several specialists who can help with this issue. Would you like to schedule an appointment?",
      ];
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage = {
        id: messages.length + 2,
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-widget-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-title">
              <span className="chat-avatar">🩺</span>
              <h3>ZeeCare Assistant</h3>
            </div>
            <button onClick={toggleChat} className="close-button" aria-label="Close chat">
              <X size={20} />
            </button>
          </div>

          <div className="messages-container" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}
              >
                <div
                  className={`message-bubble ${
                    message.sender === 'user' ? 'message-bubble-user' : 'message-bubble-bot'
                  }`}
                >
                  {message.text}
                </div>
                <div
                  className={`message-time ${
                    message.sender === 'user' ? 'time-right' : 'time-left'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="typing-indicator">
                <div className="typing-bubble">
                  <div className="dots-container">
                    <div className="dot" />
                    <div className="dot" />
                    <div className="dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>

          <div className="input-container">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              ref={inputRef}
              placeholder="Ask about our services..."
              className="message-input"
            />
            <button
              onClick={sendMessage}
              className="send-button"
              disabled={newMessage.trim() === ''}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={toggleChat}
        className={`toggle-button ${isOpen ? 'hidden' : ''}`}
        aria-label="Open chat"
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
}