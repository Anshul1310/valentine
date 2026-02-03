// src/pages/Home/Matches/Matches.jsx
import { useState } from 'react';
import styles from './Matches.module.css';

// Mock Data - In real app, this comes from backend
const MOCK_DATA = [
  { id: 1, name: 'Sanya', age: 20, matchCount: 9, img: 'https://i.pravatar.cc/300?u=sanya', common: ['Serious Relationship', 'Likes Coding', 'Night Owl'] },
  { id: 2, name: 'Rohan', age: 21, matchCount: 4, img: 'https://i.pravatar.cc/300?u=rohan', common: ['Casual Dating'] },
  { id: 3, name: 'Aditi', age: 19, matchCount: 7, img: 'https://i.pravatar.cc/300?u=aditi', common: ['Travel', 'Music', 'Dog Lover'] },
  { id: 4, name: 'Vikram', age: 22, matchCount: 2, img: 'https://i.pravatar.cc/300?u=vikram', common: ['Gym'] },
  { id: 5, name: 'Priya', age: 20, matchCount: 6, img: 'https://i.pravatar.cc/300?u=priya', common: ['Art', 'Coffee'] },
  { id: 6, name: 'Karan', age: 21, matchCount: 8, img: 'https://i.pravatar.cc/300?u=karan', common: ['Startup', 'React', 'Movies'] },
  { id: 7, name: 'Neha', age: 19, matchCount: 3, img: 'https://i.pravatar.cc/300?u=neha', common: ['Reading'] },
  { id: 8, name: 'Arjun', age: 23, matchCount: 5, img: 'https://i.pravatar.cc/300?u=arjun', common: ['Gaming', 'Pizza'] },
  { id: 9, name: 'Simran', age: 20, matchCount: 1, img: 'https://i.pravatar.cc/300?u=simran', common: [] },
  { id: 10, name: 'Dev', age: 21, matchCount: 7, img: 'https://i.pravatar.cc/300?u=dev', common: ['Cricket', 'Tech'] },
];

const Matches = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  // 1. Sort matches: Highest matches first
  const sortedMatches = [...MOCK_DATA].sort((a, b) => b.matchCount - a.matchCount);

  // Helper to get badge color styling
  const getBadgeStyle = (count) => {
    if (count >= 7) return styles.highMatch; // Green
    if (count >= 4) return styles.medMatch;  // Orange
    return styles.lowMatch;                  // Grey
  };

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Your Matches</h1>
        <p className={styles.subtitle}>Sorted by compatibility score</p>
      </div>

      {/* List */}
      <div className={styles.matchList}>
        {sortedMatches.map((user, index) => {
          const isTopMatch = index === 0; // First item gets special styling

          return (
            <div 
              key={user.id} 
              className={`${styles.card} ${isTopMatch ? styles.topMatch : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              <img src={user.img} alt={user.name} className={styles.avatar} />
              
              <div className={styles.info}>
                <div className={styles.name}>{user.name}, {user.age}</div>
                {/* Custom Badge Logic */}
                <div 
                  className={styles.matchBadge}
                  style={!isTopMatch ? { backgroundColor: getBadgeStyle(user.matchCount).backgroundColor } : {}}
                >
                  {user.matchCount}/10 Answers Matched
                </div>
              </div>

              {/* Special Crown for #1 */}
              {isTopMatch && <div className={styles.crownLabel}>👑 Best Match</div>}
            </div>
          );
        })}
      </div>

      {/* Dialog Modal */}
      {selectedUser && (
        <div className={styles.overlay} onClick={() => setSelectedUser(null)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedUser(null)}>×</button>
            
            <img src={selectedUser.img} alt={selectedUser.name} className={styles.dialogAvatar} />
            <h2 className={styles.dialogName}>{selectedUser.name}, {selectedUser.age}</h2>
            <p className={styles.dialogMeta}>🔥 {selectedUser.matchCount} Common Interests</p>

            <div className={styles.commonAnswers}>
              <p style={{marginBottom: '10px', fontWeight: '600', fontSize: '12px', color: '#888'}}>YOU BOTH LIKED:</p>
              {selectedUser.common.length > 0 ? (
                selectedUser.common.map((answer, i) => (
                  <div key={i} className={styles.answerItem}>
                    <span className={styles.check}>✓</span> {answer}
                  </div>
                ))
              ) : (
                <p className={styles.answerItem}>No specific tags, but the vibe matched!</p>
              )}
            </div>

            <button 
              className={styles.inviteBtn}
              onClick={() => alert(`Invite sent to ${selectedUser.name}!`)}
            >
              Send Invite to Chat 💌
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Matches;