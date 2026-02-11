import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Confessions.module.css';

const Confessions = () => {
  const [confessions, setConfessions] = useState([]);
  const [newConfession, setNewConfession] = useState("");
  const [quota, setQuota] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // 'popular' or 'recent'
  const [filter, setFilter] = useState('popular'); 

  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchData();
  }, [filter]); // Re-fetch when filter changes

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [feedRes, quotaRes] = await Promise.all([
        axios.get(`/api/confessions?sortBy=${filter}`, { headers }),
        axios.get('/api/confessions/quota', { headers })
      ]);

      setConfessions(feedRes.data);
      setQuota(quotaRes.data.remaining);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data", error);
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newConfession.trim()) return;
    if (quota <= 0) return alert("Quota exceeded! Come back tomorrow. 🌙");

    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/confessions', 
        { content: newConfession },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewConfession("");
      fetchData(); // Refresh list & quota
    } catch (error) {
      alert("Failed to post confession.");
    }
  };

  const handleLike = async (id) => {
    // Optimistic UI Update
    setConfessions(prev => prev.map(post => {
      if (post._id === id) {
        return {
          ...post,
          isLikedByMe: !post.isLikedByMe,
          likesCount: post.isLikedByMe ? post.likesCount - 1 : post.likesCount + 1
        };
      }
      return post;
    }));

    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`/api/confessions/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Silent refresh to sync sort order if needed, 
      // but usually better to leave it to avoid jumping UI
    } catch (error) {
      console.error("Like failed");
    }
  };

  const handleComment = async (id) => {
    const text = commentInputs[id];
    if (!text?.trim()) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`/api/confessions/${id}/comment`, 
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCommentInputs(prev => ({ ...prev, [id]: "" }));
      fetchData();
    } catch (error) {
      console.error("Comment failed");
    }
  };

  const toggleComments = (id) => {
    setOpenComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReport = async (id) => {
    const reason = prompt("Why are you reporting this confession?");
    if (reason === null) return; 

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`/api/confessions/${id}/report`, 
        { reason: reason || "Inappropriate content" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Report submitted.");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to report.";
      alert(msg);
    }
  };

  return (
    <div className={styles.container}>
      {/* Sticky Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Confessions 🎭</h1>
          <div className={styles.quotaBox}>
            <span className={styles.quotaCount}>{quota}</span>
            <span className={styles.quotaLabel}>Left</span>
          </div>
        </div>

        {/* TABS */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${filter === 'popular' ? styles.activeTab : ''}`}
            onClick={() => setFilter('popular')}
          >
            Popular 🔥
          </button>
          <button 
            className={`${styles.tab} ${filter === 'recent' ? styles.activeTab : ''}`}
            onClick={() => setFilter('recent')}
          >
            Recent 🕒
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className={styles.inputCard}>
        <textarea
          className={styles.textarea}
          placeholder={quota > 0 ? "Share a secret..." : "Daily limit reached. ❤️"}
          value={newConfession}
          onChange={(e) => setNewConfession(e.target.value)}
          disabled={quota === 0}
          maxLength={500}
        />
        <div className={styles.inputFooter}>
          <span className={styles.charCount}>{newConfession.length}/500</span>
          <button 
            className={styles.postButton} 
            onClick={handlePost}
            disabled={!newConfession.trim() || quota === 0}
          >
            Post
          </button>
        </div>
      </div>

      {/* Feed Section */}
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <div className={styles.feed}>
          {confessions.map((post) => (
            <div key={post._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={`${styles.genderTag} ${post.authorGender === 'Man' ? styles.boy : styles.girl}`}>
                  {post.authorGender === 'Man' ? '👦 Boy' : '👧 Girl'}
                </span>
                <span className={styles.date}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className={styles.content}>{post.content}</p>
              
              <div className={styles.actions}>
                <button 
                  className={`${styles.actionBtn} ${post.isLikedByMe ? styles.liked : ''}`}
                  onClick={() => handleLike(post._id)}
                >
                  <span className={styles.heartIcon}>{post.isLikedByMe ? '❤️' : '🤍'}</span> 
                  {post.likesCount}
                </button>
                
                <button 
                  className={styles.actionBtn}
                  onClick={() => toggleComments(post._id)}
                >
                  💬 {post.commentsCount}
                </button>

                <button 
                  className={styles.reportBtn}
                  onClick={() => handleReport(post._id)}
                >
                  REPORT
                </button>
              </div>

              {/* Comments Section */}
              {openComments[post._id] && (
                <div className={styles.commentSection}>
                  <div className={styles.commentList}>
                    {post.comments.length === 0 ? (
                      <p className={styles.noComments}>No comments yet.</p>
                    ) : (
                      post.comments.map((comment, i) => (
                        <div key={i} className={styles.commentBubble}>
                          <span className={styles.commentAuthor}>
                            {comment.author?.gender === 'Man' ? '👦' : '👧'} {comment.author?.name}:
                          </span>
                          <span className={styles.commentText}>{comment.text}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className={styles.commentInputBox}>
                    <input
                      type="text"
                      className={styles.commentInput}
                      placeholder="Comment..."
                      value={commentInputs[post._id] || ""}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)}
                    />
                    <button 
                      className={styles.sendCommentBtn}
                      onClick={() => handleComment(post._id)}
                    >
                      ➤
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Confessions;