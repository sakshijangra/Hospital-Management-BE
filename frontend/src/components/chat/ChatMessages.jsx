import React from 'react';
import DiseaseCard from './DiseaseCard';

const ChatMessages = ({ messages, loading, messagesEndRef }) => {
  const renderSuggestions = () => (
    <div className="chat-suggestions">
      <p>Try asking:</p>
      <div className="suggestion-buttons">
        <button onClick={() => document.querySelector('.message-input').value = "What are the symptoms of COVID-19?"}>COVID-19 symptoms</button>
        <button onClick={() => document.querySelector('.message-input').value = "How is diabetes treated?"}>Diabetes treatments</button>
        <button onClick={() => document.querySelector('.message-input').value = "What causes hypertension?"}>Hypertension causes</button>
      </div>
    </div>
  );

  return (
    <div className="chat-messages">
      {messages.length === 0 && (
        <div className="chat-welcome">
          <h3>Welcome to Medical Assistant</h3>
          <p>Ask me about any medical condition or upload an image for analysis. I can provide information about symptoms, treatments, and preventive measures.</p>
          {renderSuggestions()}
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`chat-message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
        >
          {message.text && <div className="message-text">{message.text}</div>}
          
          {message.image && (
            <div className="message-image">
              <img src={message.image} alt="Uploaded content" />
            </div>
          )}
          
          {message.diseaseInfo && (
            <DiseaseCard diseaseInfo={message.diseaseInfo} />
          )}
          
          <div className="message-time">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      ))}

      {loading && (
        <div className="chat-message bot-message">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;