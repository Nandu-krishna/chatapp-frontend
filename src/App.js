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
  
  // ===== NEW: Mobile navigation states =====
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  // ==========================================

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

  // ===== NEW: Mobile resize handler =====
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);
      
      // Reset mobile chat view when switching to desktop
      if (!newIsMobile) {
        setShowChatOnMobile(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // =====================================

  // Handle mobile sidebar close icon click
  useEffect(() => {
    const handleSidebarClose = (e) => {
      if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar.active');
        if (sidebar && e.target === sidebar) {
          const rect = sidebar.getBoundingClientRect();
          const closeIconArea = {
            left: rect.right - 50,
            right: rect.right - 10,
            top: rect.top + 10,
            bottom: rect.top + 50
          };

          if (e.clientX >= closeIconArea.left && e.clientX <= closeIconArea.right &&
              e.clientY >= closeIconArea.top && e.clientY <= closeIconArea.bottom) {
            sidebar.classList.remove('active');
          }
        }
      }
    };

    document.addEventListener('click', handleSidebarClose);
    return () => document.removeEventListener('click', handleSidebarClose);
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

  // ===== MODIFIED: handleJoinRoom to include mobile navigation =====
  const handleJoinRoom = (roomName) => {
    if (currentRoom) {
      socket.emit('leaveRoom', { username, room: currentRoom });
    }

    setCurrentRoom(roomName);
    setMessages([]);
    socket.emit('joinRoom', { username, room: roomName });
    
    // NEW: On mobile, show chat when room is selected
    if (isMobile) {
      setShowChatOnMobile(true);
    }
  };
  // =================================================================

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

  // ===== NEW: Mobile back button handler =====
  const handleBackToRooms = () => {
    setShowChatOnMobile(false);
  };
  // =============================================

  if (!isLoggedIn) {
    return <UserLogin onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="app-title">
          RealTime Chat
          <div className="app-subtitle">Connect instantly with friends</div>
        </div>
        <div className="user-info">
          <span>Hello, {username}!</span>
          <div className="user-avatar">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* ===== MODIFIED: Main area with mobile navigation ===== */}
      <div className="app-main">
        {/* Left sidebar - RoomList (hidden on mobile when chat is shown) */}
        <div className={`sidebar ${isMobile && showChatOnMobile ? 'mobile-hidden' : ''}`}>
          <RoomList
            rooms={rooms}
            currentRoom={currentRoom}
            onJoinRoom={handleJoinRoom}
            onCreateRoom={handleCreateRoom}
          />
        </div>

        {/* Center - Chat Area */}
        <div className={`chat-area ${isMobile && !showChatOnMobile ? 'mobile-hidden' : ''}`}>
          {/* NEW: Mobile back button */}
          {isMobile && showChatOnMobile && currentRoom && (
            <button className="mobile-back-btn" onClick={handleBackToRooms}>
              ← Back to Rooms
            </button>
          )}
          
          {currentRoom ? (
            <>
              <div className="chat-header">
                <h2>#{currentRoom}</h2>
                <span>{onlineUsers.length} users online</span>
              </div>
              <ChatRoom
                messages={messages}
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                currentUser={username}
                typingUsers={typingUsers}
              />
            </>
          ) : (
            <div className="no-room-selected">
              <h2>Select a room to start chatting</h2>
              <p>Choose a room from the list to begin your conversation</p>
            </div>
          )}
        </div>

        {/* Right sidebar - Online Users (hidden on mobile) */}
        <div className={`sidebar ${isMobile ? 'mobile-hidden' : ''}`}>
          <OnlineUsersList users={onlineUsers} />
        </div>
      </div>
      {/* ================================================== */}

      {/* Notifications */}
      <div className="notification-container">
        {notifications.map(notification => (
          <div key={notification.id} className="notification">
            <div className="notification-icon">👋</div>
            <div>{notification.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
