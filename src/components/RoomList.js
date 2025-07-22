import React, { useState } from 'react';

const RoomList = ({ rooms, currentRoom, onJoinRoom, onCreateRoom }) => {
  const [newRoomName, setNewRoomName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      onCreateRoom(newRoomName.trim());
      setNewRoomName('');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="room-list">
      <header className="room-list-header">
        <h3 className="room-list-title">Rooms</h3>
        <button
          className="toggle-create-room"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'New Room'}
        </button>
      </header>

      {showCreateForm && (
        <form onSubmit={handleCreateRoom} className="create-room-form">
          <input
            type="text"
            className="create-room-input"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Room name"
            maxLength={50}
            required
          />
          <button type="submit" className="create-room-submit">Create</button>
        </form>
      )}

      <ul className="room-list-items">
        {rooms.length === 0 ? (
          <p className="no-rooms">No rooms. Create one!</p>
        ) : (
          rooms.map((room) => (
            <li key={room._id} className="room-item">
              <button
                className={`room-button ${currentRoom === room.name ? 'active-room' : ''}`}
                onClick={() => onJoinRoom(room.name)}
                disabled={currentRoom === room.name}
              >
                {room.name}
                {currentRoom === room.name && ' (Active)'}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default RoomList;
