import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import './ChatWidget.css';
import { processTextQuery, processImageUpload } from '../../services/chatService';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text, image = null) => {
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date(),
      image: image ? URL.createObjectURL(image) : null,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      let response;
      
      // Process based on whether there's an image or text
      if (image) {
        response = await processImageUpload(image);
      } else {
        response = await processTextQuery(text);
      }

      // Add bot response to chat
      const botResponse = {
        id: Date.now() + 1,
        text: response.message,
        sender: 'bot',
        timestamp: new Date(),
        diseaseInfo: response.diseaseInfo || null,
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget-container">
      {!isOpen && (
        <button className="chat-widget-button" onClick={toggleChat}>
          <span className="chat-widget-icon">💬</span>
          <span>Medical Assistant</span>
        </button>
      )}

      {isOpen && (
        <div className="chat-widget-popup">
          <ChatHeader toggleChat={toggleChat} />
          <ChatMessages 
            messages={messages} 
            loading={loading} 
            messagesEndRef={messagesEndRef} 
          />
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      )}
    </div>
  );
};

export default ChatWidget;