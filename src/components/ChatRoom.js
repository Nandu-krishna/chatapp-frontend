import React, { useEffect, useRef } from 'react';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

const ChatRoom = ({ messages, onSendMessage, onTyping, currentUser, typingUsers }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-room">
      <header className="chat-header">
        <h2 className="chat-title">Chat Room</h2>
      </header>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet. Start chatting!</p>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.username === currentUser ? 'sent' : 'received'}`}
            >
              <div className="message-meta">
                <span className="message-username">{message.username}</span>
                <span className="message-time">{formatTimestamp(message.timestamp)}</span>
              </div>
              <div className="message-text">{message.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <TypingIndicator typingUsers={typingUsers} currentUser={currentUser} />

      <MessageInput onSendMessage={onSendMessage} onTyping={onTyping} />
    </div>
  );
};

export default ChatRoom;
