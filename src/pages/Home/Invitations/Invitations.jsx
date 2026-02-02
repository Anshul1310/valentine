// src/pages/Home/Invitations/Invitations.jsx
import { useState } from 'react';
import styles from './Invitations.module.css';

// Mock Data: Incoming Invitations
const MOCK_INVITES = [
  { 
    id: 101, 
    name: 'Aarav', 
    age: 21, 
    img: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Aarav&flip=true',
    sentTime: '2 hrs ago',
    // The 2 Descriptive Answers
    answers: [
      { q: "My perfect Sunday involves...", a: "Coding a new side project while sipping unlimited coffee ☕" },
      { q: "A controversial opinion I have is...", a: "Pineapple absolutely belongs on pizza. Fight me! 🍕" }
    ]
  },
  { 
    id: 102, 
    name: 'Zara', 
    age: 20, 
    img: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Zara',
    sentTime: '5 hrs ago',
    answers: [
      { q: "My perfect Sunday involves...", a: "Sleeping in until noon and then binge-watching anime." },
      { q: "A controversial opinion I have is...", a: "React Native > Flutter. Any day." }
    ]
  },
  { 
    id: 103, 
    name: 'Ishaan', 
    age: 22, 
    img: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Ishaan&flip=true',
    sentTime: 'Yesterday',
    answers: [
      { q: "My perfect Sunday involves...", a: "Going for a long bike ride on the highway." },
      { q: "A controversial opinion I have is...", a: "Tabs are superior to spaces." }
    ]
  }
];

const Invitations = () => {
  const [invites, setInvites] = useState(MOCK_INVITES);
  const [selectedInvite, setSelectedInvite] = useState(null); // For Modal

  // Handle Accept
  const handleAccept = (id) => {
    // API Call would go here
    alert("Invitation Accepted! You can now chat.");
    setInvites(prev => prev.filter(inv => inv.id !== id));
    setSelectedInvite(null);
  };

  // Handle Decline
  const handleDecline = (id) => {
    if(window.confirm("Are you sure you want to decline?")) {
      setInvites(prev => prev.filter(inv => inv.id !== id));
      setSelectedInvite(null);
    }
  };

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Invitations</h1>
        <p className={styles.subtitle}>People who want to match with you</p>
      </div>

      {/* List */}
      <div className={styles.list}>
        {invites.length > 0 ? (
          invites.map((invite) => (
            <div key={invite.id} className={styles.card}>
              
              {/* Top Row: User Info */}
              <div className={styles.cardHeader}>
                <img src={invite.img} alt={invite.name} className={styles.avatar} />
                <div className={styles.info}>
                  <div className={styles.name}>{invite.name}, {invite.age}</div>
                  <div className={styles.meta}>Sent {invite.sentTime}</div>
                  
                  {/* Link to Open Modal */}
                  <button 
                    className={styles.viewProfileBtn}
                    onClick={() => setSelectedInvite(invite)}
                  >
                    📝 View Answers & Profile
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.actions}>
                <button 
                  className={`${styles.actionBtn} ${styles.declineBtn}`}
                  onClick={() => handleDecline(invite.id)}
                >
                  ✖ Decline
                </button>
                <button 
                  className={`${styles.actionBtn} ${styles.acceptBtn}`}
                  onClick={() => handleAccept(invite.id)}
                >
                  ✔ Accept
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <p>No pending invitations.</p>
          </div>
        )}
      </div>

      {/* --- Detail Modal (Shows Descriptive Answers) --- */ }
      {selectedInvite && (
        <div className={styles.overlay} onClick={() => setSelectedInvite(null)}>
          <div className={styles.dialog} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedInvite(null)}>×</button>

            <div className={styles.dialogHeader}>
              <img src={selectedInvite.img} alt="Avatar" className={styles.dialogAvatar} />
              <h2 className={styles.name}>{selectedInvite.name}, {selectedInvite.age}</h2>
            </div>

            {/* Render the 2 Descriptive Questions */}
            <span className={styles.sectionLabel}>THEIR ANSWERS</span>
            
            {selectedInvite.answers.map((item, index) => (
              <div key={index} className={styles.answerBox}>
                <span className={styles.questionText}>{item.q}</span>
                <p className={styles.answerText}>"{item.a}"</p>
              </div>
            ))}

            <div className={styles.actions} style={{marginTop: '20px'}}>
              <button 
                className={`${styles.actionBtn} ${styles.acceptBtn}`}
                onClick={() => handleAccept(selectedInvite.id)}
              >
                Accept Invite
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Invitations;