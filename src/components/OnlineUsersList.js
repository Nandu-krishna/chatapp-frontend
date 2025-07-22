import React from 'react';

const OnlineUsersList = ({ users, currentUser }) => {
  return (
    <div className="online-users">
      <h3 className="online-users-title">Online ({users.length})</h3>
      <ul className="online-users-list">
        {users.length === 0 ? (
          <p className="no-users">No users online</p>
        ) : (
          users.map((user, index) => (
            <li key={index} className="online-user">
              {user}
              {user === currentUser && <span className="you-tag"> (You)</span>}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default OnlineUsersList;
