// src/pages/Terms/Terms.jsx
import { useNavigate } from 'react-router-dom';
import styles from './Terms.module.css';

const Terms = () => {
  const navigate = useNavigate();

  const handleAgree = () => {
    // Navigate to the next step: Questions or Gender Select
    navigate('/gender'); 
  };

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>House Rules</h1>
        <p className={styles.subtitle}>
          Before we start matching, please agree to our community guidelines.
        </p>
      </div>

      {/* Scrollable Content */}
      <div className={styles.content}>
        
        {/* Rule 1 */}
        <div className={styles.section}>
          <h2 className={styles.heading}>
            <span className={styles.sectionIcon}>🤝</span> 
            Be Yourself
          </h2>
          <p className={styles.text}>
            Make sure your photos, age, and bio are accurate. We value authenticity above all else. 
            Fake profiles or impersonation will lead to an immediate ban.
          </p>
        </div>

        {/* Rule 2 */}
        <div className={styles.section}>
          <h2 className={styles.heading}>
            <span className={styles.sectionIcon}>🛡️</span> 
            Stay Safe
          </h2>
          <p className={styles.text}>
            Don't be too quick to give out personal information. Date in public places. 
            If you ever feel uncomfortable, use our reporting tools immediately.
          </p>
        </div>

        {/* Important Highlight */}
        <div className={styles.highlightBox}>
          <p className={styles.highlightText}>
            ⚠️ Zero Tolerance Policy: Harassment, hate speech, or explicit content sent without consent 
            will result in a permanent account suspension.
          </p>
        </div>

        {/* Rule 3 */}
        <div className={styles.section}>
          <h2 className={styles.heading}>
            <span className={styles.sectionIcon}>💖</span> 
            Be Kind
          </h2>
          <p className={styles.text}>
            Respect everyone's boundaries. Ghosting happens, but try to be communicative. 
            Treat others how you would want to be treated.
          </p>
        </div>

        {/* Rule 4 */}
        <div className={styles.section}>
          <h2 className={styles.heading}>
            <span className={styles.sectionIcon}>🎓</span> 
            College Only
          </h2>
          <p className={styles.text}>
            This platform is exclusive to verified students. Sharing your account credentials 
            with outsiders undermines the safety of our community.
          </p>
        </div>

      </div>

      {/* Sticky Footer */}
      <div className={styles.footer}>
        <button className={styles.agreeButton} onClick={handleAgree}>
          I Agree & Continue
        </button>
        <span className={styles.disclaimer}>
          By tapping "I Agree", you accept our Terms of Service.
        </span>
      </div>

    </div>
  );
};

export default Terms;