import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './GenderSelect.module.css';

const GenderSelect = () => {
  const [selectedGender, setSelectedGender] = useState(null);
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selectedGender) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.put('/api/user/gender', 
        { gender: selectedGender },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Navigate to Questions after Gender
      navigate('/questions');
    } catch (error) {
      console.error("Error saving gender:", error);
      alert("Failed to save gender.");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>How do you identify?</h2>
      <p className={styles.subtitle}>Help us find you the right matches.</p>

      <div className={styles.optionsGrid}>
        {['Man', 'Woman', 'Non-binary'].map((gender) => (
          <button
            key={gender}
            className={`${styles.optionCard} ${selectedGender === gender ? styles.selected : ''}`}
            onClick={() => setSelectedGender(gender)}
          >
            {gender}
          </button>
        ))}
      </div>

      <div className={styles.footer}>
        <button 
          className={styles.nextButton}
          disabled={!selectedGender}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default GenderSelect;