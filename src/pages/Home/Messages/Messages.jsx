// src/pages/Home/Messages/Messages.jsx
import styles from './Messages.module.css';

const MOCK_CHATS = [
  { id: 1, name: 'Anuj', message: 'Hey! Did you check the new project?', time: '2:30 PM', unread: 2, online: true, img: 'https://i.pravatar.cc/150?u=anuj' },
  { id: 2, name: 'Shreya', message: 'The prototype looks amazing 🔥', time: '1:15 PM', unread: 0, online: true, img: 'https://i.pravatar.cc/150?u=shreya' },
  { id: 3, name: 'Rahul', message: 'Let’s meet at the library.', time: 'Yesterday', unread: 0, online: false, img: 'https://i.pravatar.cc/150?u=rahul' },
  { id: 4, name: 'Priya', message: 'Sent you the notes.', time: 'Yesterday', unread: 1, online: false, img: 'https://i.pravatar.cc/150?u=priya' },
];

const Messages = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Messages</h2>
        
        {/* Horizontal Stories / Online List */}
        <div className={styles.storiesContainer}>
          {MOCK_CHATS.filter(c => c.online).map(user => (
            <div key={user.id} className={styles.storyItem}>
              <div className={styles.avatarWrapper}>
                <img src={user.img} alt={user.name} className={styles.avatar} />
                <div className={styles.onlineBadge} />
              </div>
              <span className={styles.storyName}>{user.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vertical Chat List */}
      <div className={styles.chatList}>
        {MOCK_CHATS.map(chat => (
          <div key={chat.id} className={styles.chatItem}>
            <img src={chat.img} alt={chat.name} className={styles.chatAvatar} />
            <div className={styles.chatInfo}>
              <div className={styles.chatHeader}>
                <span className={styles.userName}>{chat.name}</span>
                <span className={styles.time}>{chat.time}</span>
              </div>
              <div className={styles.lastMessage}>
                <span className={styles.msgText}>{chat.message}</span>
                {chat.unread > 0 && (
                  <span className={styles.unreadBadge}>{chat.unread}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Messages;