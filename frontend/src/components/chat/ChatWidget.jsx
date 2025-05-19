import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Upload } from 'lucide-react';
import './ChatWidget.css';
import DiseaseCard from './DiseaseCard';

const initialMessage = {
  id: 1,
  text: 'Hello! I\'m your MediCare assistant. How can I help you with your medical questions today?',
  sender: 'bot',
  timestamp: new Date().toISOString(),
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-open the chat widget with a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
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

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === '' && !image) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: newMessage,
      image: imagePreview,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    // If there's an image, we'd handle it differently
    if (image) {
      // In a real implementation, you'd upload the image to a server
      // and get analysis back. For now, we'll simulate a response.
      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          text: "I've analyzed the image but currently can only provide general information. Could you describe the symptoms or condition you're concerned about?",
          sender: 'bot',
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, botResponse]);
        setIsLoading(false);
        clearImage();
      }, 2000);
      
      return;
    }

    try {
      // Send query to backend
      const response = await fetch('http://127.0.0.1:5000/api/medical-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: newMessage }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      
      // Create bot response with the data we received
      const botResponse = {
        id: Date.now() + 1,
        text: data.message,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        diseaseInfo: data.diseaseInfo,
        sources: data.sources
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error fetching response:', error);
      
      // Fallback response in case of error
      const errorResponse = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting to my knowledge base right now. Please try again later or contact support if this persists.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
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

  // Suggested medical queries
  const suggestions = [
    "What are symptoms of diabetes?",
    "How is hypertension treated?",
    "What causes migraines?",
    "Tell me about COVID-19"
  ];

  const setQueryFromSuggestion = (suggestion) => {
    setNewMessage(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="chat-widget-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-title">
              <span className="chat-avatar">🩺</span>
              <h3>Medical Assistant</h3>
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
                  
                  {message.image && (
                    <div className="message-image">
                      <img src={message.image} alt="Uploaded" />
                    </div>
                  )}
                  
                  {message.diseaseInfo && Object.keys(message.diseaseInfo).length > 0 && (
                    <DiseaseCard diseaseInfo={message.diseaseInfo} />
                  )}
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="message-sources">
                      <small>Sources: {message.sources.length} documents referenced</small>
                    </div>
                  )}
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

            {/* Display suggestions if it's a new conversation */}
            {messages.length === 1 && (
              <div className="suggestions">
                <p>Try asking about:</p>
                <div className="suggestion-buttons">
                  {suggestions.map((suggestion, index) => (
                    <button 
                      key={index} 
                      onClick={() => setQueryFromSuggestion(suggestion)}
                      className="suggestion-button"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
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

          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <button onClick={clearImage} className="clear-image-button">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="input-container">
            <textarea
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              ref={inputRef}
              placeholder="Ask a medical question..."
              className="message-input"
              rows={1}
            />
            
            <label className="upload-button" htmlFor="image-upload">
              <Upload size={18} />
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
            </label>
            
            <button
              onClick={sendMessage}
              className="send-button"
              disabled={newMessage.trim() === '' && !image}
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