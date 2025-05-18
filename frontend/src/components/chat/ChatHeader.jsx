import React from 'react';

const ChatHeader = ({ toggleChat }) => {
  return (
    <div className="chat-header">
      <div className="chat-title">
        <span className="chat-avatar">🩺</span>
        <h3>Medical Assistant</h3>
      </div>
      <button className="chat-close-btn" onClick={toggleChat}>✕</button>
    </div>
  );
};

export default ChatHeader;