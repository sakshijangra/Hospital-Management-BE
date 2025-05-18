import React, { useState } from 'react';

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      setImage(selectedImage);
      setPreview(URL.createObjectURL(selectedImage));
    }
  };
  
  const handleSendMessage = () => {
    if (message.trim() || image) {
      onSendMessage(message, image);
      setMessage('');
      setImage(null);
      setPreview(null);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const clearImage = () => {
    setImage(null);
    setPreview(null);
  };

  return (
    <div className="chat-input">
      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Preview" />
          <button className="clear-image-btn" onClick={clearImage}>✕</button>
        </div>
      )}
      
      <div className="input-container">
        <textarea
          value={message}
          onChange={handleMessageChange}
          onKeyPress={handleKeyPress}
          placeholder="Ask about a disease or upload an image..."
          className="message-input"
          rows={1}
        />
        
        <div className="chat-actions">
          <label className="upload-btn" htmlFor="image-upload">
            📷
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>
          
          <button 
            className="send-btn" 
            onClick={handleSendMessage}
            disabled={!message.trim() && !image}
          >
            📤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;