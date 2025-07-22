import React from 'react';

const TypingIndicator = ({ typingUsers, currentUser }) => {
  const otherTypingUsers = typingUsers.filter(user => user !== currentUser);

  if (otherTypingUsers.length === 0) {
    return null;
  }

  const getTypingMessage = () => {
    if (otherTypingUsers.length === 1) {
      return `${otherTypingUsers[0]} is typing...`;
    } else if (otherTypingUsers.length === 2) {
      return `${otherTypingUsers[0]} and ${otherTypingUsers[1]} are typing...`;
    } else {
      return `${otherTypingUsers.length} users are typing...`;
    }
  };

  return (
    <div className="typing-indicator">
      <em>{getTypingMessage()}</em>
    </div>
  );
};

export default TypingIndicator;
