import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Matches.module.css';

const QUESTION_MAP = {
  2: "Ideal First Date",
  4: "One thing I can't live without"
};

const Matches = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('/api/user/matches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecommendations(res.data.recommendations);
      setSentRequests(res.data.sent);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching matches", error);
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`/api/user/invite/${selectedUser._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSentRequests(prev => [...prev, selectedUser]);
      setRecommendations(prev => prev.filter(u => u._id !== selectedUser._id));
      alert(`Invite sent to ${selectedUser.name}! 💌`);
      setSelectedUser(null);
    } catch (error) {
      alert("Failed to send invite.");
    }
  };

  if (loading) return <div className={styles.loading}>Finding Cupid... 💘</div>;

  return (
    <div className={styles.container}>
      {/* Sticky Header */}
      <div className={styles.header}>
        <h3 className={styles.pageTitle}>Matches 🔥</h3>
        <p className={styles.pageSubtitle}>Find your spark here</p>
      </div>

      <div className={styles.scrollContent}>
        {/* --- Sent Requests --- */}
        {sentRequests.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>⏳ Pending</h3>
            <div className={styles.pendingList}>
              {sentRequests.map(user => (
                <div key={user._id} className={styles.pendingCard}>
                  <div className={styles.avatarSmall}>
                    {user.gender === 'Man' ? '👨' : '👩'}
                  </div>
                  <div className={styles.info}>
                    <h4>{user.name}</h4>
                    <span className={styles.statusTag}>Waiting...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Recommendations --- */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>✨ Recommended</h3>
          <div className={styles.matchList}>
            {recommendations.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No new profiles right now.</p>
              </div>
            ) : (
              recommendations.map((match, index) => (
                <div key={match._id} className={styles.matchCard}>
                  {index === 0 && <div className={styles.crown}>👑 Top Pick</div>}
                  
                  <div className={styles.cardHeader}>
                    <div className={styles.matchAvatar}>
                      {match.gender === 'Man' ? '👨' : '👩'}
                    </div>
                    <div className={styles.matchScore}>
                      {match.matchCount} Common
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <h3>{match.name}</h3>
                    <div className={styles.tags}>
                      {match.commonInterests.slice(0, 3).map((tag, i) => (
                        <span key={i} className={styles.pill}>{tag}</span>
                      ))}
                      {match.commonInterests.length > 3 && (
                        <span className={styles.pill}>+{match.commonInterests.length - 3}</span>
                      )}
                    </div>
                  </div>

                  <button 
                    className={styles.inviteButton}
                    onClick={() => setSelectedUser(match)}
                  >
                    View & Invite
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- Modal --- */}
      {selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalAvatar}>
                {selectedUser.gender === 'Man' ? '👨' : '👩'}
              </div>
              <h2>{selectedUser.name}</h2>
              <p>Send invitation?</p>
            </div>
            <div className={styles.modalBody}>
              <h4 className={styles.detailsTitle}>Vibe Check</h4>
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
                <p className={styles.noInfo}>No bio details.</p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setSelectedUser(null)}>Cancel</button>
              <button className={styles.confirmBtn} onClick={handleSendInvite}>
                Send Invite 💌
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;