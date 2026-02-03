// src/pages/Home/Confessions/Confessions.jsx
import { useState } from 'react';
import styles from './Confessions.module.css';

// Mock Data for initial feed
const INITIAL_CONFESSIONS = [
  {
    id: 1,
    name: "Riya",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Riya",
    text: "I still check my ex's Spotify playlists to see if they are sad. Is that toxic? 😅",
    time: "20 mins ago",
    likes: 12
  },
  {
    id: 2,
    name: "Aryan",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Aryan&flip=true",
    text: "Honestly, I just want someone to eat momos with at 2 AM. That's the dream.",
    time: "4 hours ago",
    likes: 45
  },
  {
    id: 3,
    name: "Sneha",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Sneha",
    text: "I told my date I love hiking. I have never hiked in my life. Someone help me.",
    time: "Yesterday",
    likes: 8
  }
];

const Confessions = () => {
  const [feed, setFeed] = useState(INITIAL_CONFESSIONS);
  const [newPost, setNewPost] = useState("");
  
  // Current User (You)
  const myProfile = {
    name: "You",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Anshul&flip=true" // Replace with actual user avatar
  };

  const handlePost = () => {
    if (!newPost.trim()) return;

    const post = {
      id: Date.now(),
      name: myProfile.name,
      avatar: myProfile.avatar,
      text: newPost,
      time: "Just now",
      likes: 0
    };

    setFeed([post, ...feed]); // Add new post to top
    setNewPost(""); // Clear input
  };

  const handleLike = (id) => {
    setFeed(feed.map(item => 
      item.id === id ? { ...item, likes: item.likes + 1, liked: true } : item
    ));
  };

  return (
    <div className={styles.container}>
      
      {/* 1. Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Confessions</h1>
        <p className={styles.subtitle}>Share your secrets or random thoughts 🤫</p>
      </div>

      {/* 2. Create Post Input */}
      <div className={styles.createPostContainer}>
        <img src={myProfile.avatar} alt="You" className={styles.currentUserAvatar} />
        <div className={styles.inputWrapper}>
          <textarea
            className={styles.textArea}
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <div className={styles.postActions}>
            <button 
              className={styles.postButton} 
              disabled={!newPost.trim()}
              onClick={handlePost}
            >
              Post
            </button>
          </div>
        </div>
      </div>

      {/* 3. The Feed */}
      <div className={styles.feed}>
        {feed.map((item) => (
          <div key={item.id} className={styles.card}>
            
            {/* Card Header: Profile Info */}
            <div className={styles.cardHeader}>
              <img src={item.avatar} alt={item.name} className={styles.cardAvatar} />
              <div className={styles.cardMeta}>
                <span className={styles.cardName}>{item.name}</span>
                <span className={styles.cardTime}>{item.time}</span>
              </div>
            </div>

            {/* Content */}
            <div className={styles.cardBody}>
              {item.text}
            </div>

            {/* Footer: Likes */}
            <div className={styles.cardFooter}>
              <div 
                className={`${styles.actionIcon} ${item.liked ? styles.liked : ''}`}
                onClick={() => handleLike(item.id)}
              >
                {item.liked ? '❤️' : '🤍'} {item.likes} Likes
              </div>
              <div className={styles.actionIcon}>
                💬 Reply
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default Confessions;