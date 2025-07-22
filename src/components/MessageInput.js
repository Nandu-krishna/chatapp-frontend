import React, { useState, useRef } from 'react';

const MessageInput = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (message.trim()) {
      onSendMessage(message);
      setMessage('');

      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <input
          type="text"
          className="message-input"
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          maxLength={500}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!message.trim()}
        >
          Send
        </button>
      </form>
      <div className="char-count">{message.length}/500</div>
    </div>
  );
};

export default MessageInput;
