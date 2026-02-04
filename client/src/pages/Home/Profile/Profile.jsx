import { useState, useEffect } from 'react';
import styles from './Profile.module.css';

// 10 Boys & 10 Girls (DiceBear Adventurer seeds)
const AVATAR_OPTIONS = {
  boys: [
    'Felix', 'Aneka', 'Jack', 'Oliver', 'Max', 
    'Leo', 'Ryan', 'Ethan', 'Caleb', 'Liam'
  ].map(seed => `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&flip=true`),
  
  girls: [
    'Lisa', 'Annie', 'Zoe', 'Mila', 'Ruby', 
    'Sara', 'Bella', 'Maya', 'Nora', 'Eva'
  ].map(seed => `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`)
};

const Profile = () => {
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [activeTab, setActiveTab] = useState('boys'); 
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch current random nickname/avatar on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/user/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.name) setNickname(data.name);
        if (data.avatar) setSelectedAvatar(data.avatar);
        else setSelectedAvatar(AVATAR_OPTIONS.boys[0]); // Fallback
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to load profile", err);
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          nickname: nickname, 
          avatar: selectedAvatar 
        })
      });

      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      } else {
        alert("Failed to save changes");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    }
  };

  if (loading) return <div className={styles.container}>Loading...</div>;

  return (
    <div className={styles.container}>
      
      {/* 1. Header Card */}
      <div className={styles.headerCard}>
        <img src={selectedAvatar} alt="Profile" className={styles.largeAvatar} />
        <h1 className={styles.nicknameDisplay}>{nickname || 'User'}</h1>
        <span className={styles.status}>✨ Ready to Match</span>
      </div>

      {/* 2. Edit Form Section */}
      <div className={styles.editSection}>
        
        {/* Nickname Input */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>DISPLAY NAME</label>
          <input 
            type="text" 
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className={styles.nicknameInput}
            placeholder="Enter your nickname"
            maxLength={15}
          />
        </div>

        {/* Avatar Selection */}
        <div className={styles.sectionTitle}>
          <span>Choose Avatar</span>
        </div>

        {/* Tabs for Boys/Girls */}
        <div className={styles.tabs}>
          <div 
            className={`${styles.tab} ${activeTab === 'boys' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('boys')}
          >
            Boys
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'girls' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('girls')}
          >
            Girls
          </div>
        </div>

        {/* The Grid */}
        <div className={styles.avatarGrid}>
          {AVATAR_OPTIONS[activeTab].map((url, index) => (
            <div 
              key={index}
              className={`${styles.avatarOption} ${selectedAvatar === url ? styles.selectedAvatar : ''}`}
              onClick={() => setSelectedAvatar(url)}
            >
              <img src={url} alt={`Avatar ${index}`} className={styles.img} />
            </div>
          ))}
        </div>

        {/* Save Button */}
        <button className={styles.saveButton} onClick={handleSave}>
          {isSaved ? "Saved Successfully! 🎉" : "Save Changes"}
        </button>

      </div>
    </div>
  );
};

export default Profile;