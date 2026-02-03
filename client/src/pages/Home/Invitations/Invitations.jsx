import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Invitations.module.css'; // Uses same/similar styling

const QUESTION_MAP = {
  2: "Ideal First Date",
  4: "One thing I can't live without"
};

const Invitations = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      // We reuse the same endpoint but focus on 'pending' data
      const res = await axios.get('http://localhost:5000/api/user/matches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequests(res.data.pending);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching invitations", error);
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`http://localhost:5000/api/user/accept/${selectedUser._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPendingRequests(prev => prev.filter(u => u._id !== selectedUser._id));
      alert("It's a Match! Go to Chat! 🎉");
      setSelectedUser(null);
    } catch (error) {
      alert("Failed to accept invite.");
    }
  };

  if (loading) return <div className={styles.loading}>Checking mailbox... 📬</div>;

  return (
    <div className={styles.container}>
      <h3 className={styles.pageTitle}>Invitations 💌</h3>
      <p className={styles.subtitle}>People who want to match with you.</p>

      <div className={styles.list}>
        {pendingRequests.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.ghostIcon}>👻</div>
            <p>No invitations yet.</p>
            <span className={styles.hint}>Go to Matches to find people!</span>
          </div>
        ) : (
          pendingRequests.map(user => (
            <div key={user._id} className={styles.inviteCard}>
              <div className={styles.row}>
                <div className={styles.avatar}>
                  {user.gender === 'Man' ? '👦' : '👧'}
                </div>
                <div className={styles.info}>
                  <h4>{user.name}</h4>
                  <span>Sent you a request</span>
                </div>
                <button 
                  className={styles.viewButton} 
                  onClick={() => setSelectedUser(user)}
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- REUSABLE DIALOG BOX (For Accepting) --- */}
      {selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalAvatar}>
                {selectedUser.gender === 'Man' ? '👦' : '👧'}
              </div>
              <h2>{selectedUser.name}</h2>
              <p>Do you want to accept their request?</p>
            </div>

            <div className={styles.modalBody}>
              <h4 className={styles.detailsTitle}>Their Profile</h4>
              {selectedUser.answers.filter(a => a.questionType === 'text').length > 0 ? (
                selectedUser.answers
                  .filter(a => a.questionType === 'text')
                  .map((ans, i) => (
                    <div key={i} className={styles.qnaBlock}>
                      <p className={styles.qLabel}>{QUESTION_MAP[ans.questionId] || "Question"}</p>
                      <p className={styles.qAnswer}>"{ans.textAnswer}"</p>
                    </div>
                  ))
              ) : (
                <p className={styles.noInfo}>No answers provided.</p>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setSelectedUser(null)}>Ignore</button>
              <button className={styles.acceptBtn} onClick={handleAccept}>
                Accept & Chat ✅
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invitations;