import React, { useState } from 'react';

const UserLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError('Username is required');
      return;
    }

    if (trimmedUsername.length < 3) {
      setError('At least 3 characters');
      return;
    }

    if (trimmedUsername.length > 20) {
      setError('Max 20 characters');
      return;
    }

    const validUsernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!validUsernameRegex.test(trimmedUsername)) {
      setError('Only letters, numbers, underscores');
      return;
    }

    setError('');
    onLogin(trimmedUsername);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome</h1>
        <h2 className="login-subtitle">Enter Username</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            maxLength={20}
            required
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-button">Join</button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
