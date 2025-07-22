import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import ChatRoom from './components/ChatRoom';
import RoomList from './components/RoomList';
import UserLogin from './components/UserLogin';
import OnlineUsersList from './components/OnlineUsersList';
import './styles.css'; 

const socket = io(process.env.REACT_APP_BACKEND_URL);

console.log("ENV BACKEND:", process.env.REACT_APP_BACKEND_URL);



function App() {
  const [username, setUsername] = useState('');
  const [currentRoom, setCurrentRoom] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on('message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socket.on('chatHistory', (history) => {
      setMessages(history);
    });

    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    socket.on('userJoined', (message) => {
      addNotification(message);
    });

    socket.on('userLeft', (message) => {
      addNotification(message);
    });

    socket.on('userTyping', (data) => {
      const { username: typingUser, isTyping } = data;
      if (isTyping) {
        setTypingUsers(prev => [...prev.filter(user => user !== typingUser), typingUser]);
      } else {
        setTypingUsers(prev => prev.filter(user => user !== typingUser));
      }
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(user => user !== typingUser));
      }, 3000);
    });

    socket.on('error', (error) => {
      alert('Error: ' + error);
    });

    return () => {
      socket.off('message');
      socket.off('chatHistory');
      socket.off('onlineUsers');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('userTyping');
      socket.off('error');
    };
  }, []);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/rooms`);
      const roomsData = await response.json();
      setRooms(roomsData);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const addNotification = (message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, 5000);
  };

  const handleLogin = (enteredUsername) => {
    setUsername(enteredUsername);
    setIsLoggedIn(true);
  };

  const handleJoinRoom = (roomName) => {
    if (currentRoom) {
      socket.emit('leaveRoom', { username, room: currentRoom });
    }
    setCurrentRoom(roomName);
    setMessages([]);
    socket.emit('joinRoom', { username, room: roomName });
  };

  const handleCreateRoom = async (roomName) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: roomName }),
      });

      if (response.ok) {
        fetchRooms();
        handleJoinRoom(roomName);
      } else {
        const error = await response.json();
        alert('Error creating room: ' + error.error);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Error creating room');
    }
  };

  const handleSendMessage = (message) => {
    if (message.trim() && currentRoom) {
      socket.emit('chatMessage', {
        room: currentRoom,
        username,
        message
      });
    }
  };

  const handleTyping = (isTyping) => {
    if (currentRoom) {
      socket.emit('typing', {
        room: currentRoom,
        username,
        isTyping
      });
    }
  };

  if (!isLoggedIn) {
    return <UserLogin onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Real-Time Chat App</h1>
        <p className="app-subtitle">Welcome, {username}!</p>
        {currentRoom && <p className="current-room">Room: {currentRoom}</p>}
      </header>

      {notifications.length > 0 && (
        <div className="notification-container">
          {notifications.map(notif => (
            <div key={notif.id} className="notification">
              {notif.message}
            </div>
          ))}
        </div>
      )}

      <main className="app-main">
        <aside className="sidebar room-list">
          <RoomList
            rooms={rooms}
            currentRoom={currentRoom}
            onJoinRoom={handleJoinRoom}
            onCreateRoom={handleCreateRoom}
          />
        </aside>

        <section className="chat-area">
          {currentRoom ? (
            <ChatRoom
              messages={messages}
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              currentUser={username}
              typingUsers={typingUsers}
            />
          ) : (
            <div className="no-room-selected">
              <p>Select a room to start chatting</p>
            </div>
          )}
        </section>

        <aside className="sidebar online-users">
          <OnlineUsersList users={onlineUsers} currentUser={username} />
        </aside>
      </main>
    </div>
  );
}

export default App;
