import React, { useState, useRef } from 'react';

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      
      // Check if it's an image
      if (!selectedImage.type.startsWith('image/')) {
        alert('Please select an image file (jpg, png, etc.)');
        return;
      }
      
      // Check file size (limit to 5MB)
      if (selectedImage.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setIsUploading(true);
      
      // Simulate upload delay
      setTimeout(() => {
        setImage(selectedImage);
        setPreview(URL.createObjectURL(selectedImage));
        setIsUploading(false);
      }, 1000);
    }
  };
  
  const handleSendMessage = () => {
    if (message.trim() || image) {
      onSendMessage(message, image);
      setMessage('');
      setImage(null);
      setPreview(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          placeholder={image ? "Add a message about this image..." : "Ask about symptoms, diseases, treatments..."}
          className="message-input"
          rows={1}
        />
        
        <div className="chat-actions">
          <label className="upload-btn" htmlFor="image-upload">
            {isUploading ? '⏳' : '📷'}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              ref={fileInputRef}
              disabled={isUploading}
            />
          </label>
          
          <button 
            className="send-btn" 
            onClick={handleSendMessage}
            disabled={(!message.trim() && !image) || isUploading}
          >
            {isUploading ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;