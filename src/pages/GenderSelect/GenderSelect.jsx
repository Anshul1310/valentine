// src/pages/GenderSelect/GenderSelect.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios'; // Uncomment when connecting to backend
import styles from './GenderSelect.module.css';

const GenderSelect = () => {
  const [selectedGender, setSelectedGender] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const options = [
    { id: 'man', label: 'Man' },
    { id: 'woman', label: 'Woman' },
    { id: 'more', label: 'More' }
  ];

  const handleContinue = async () => {
    if (!selectedGender) return;
    setLoading(true);

    try {
      // TODO: Send gender to backend here
      // const token = localStorage.getItem('authToken');
      // await axios.post('http://localhost:5000/api/user/update', 
      //   { gender: selectedGender },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      
      console.log("Gender Selected:", selectedGender);
      
      // Navigate to the next step (Questions)
      navigate('/questions');
      
    } catch (error) {
      console.error("Failed to save gender", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>I am a</h1>
        <p className={styles.subtitle}>Select your gender to help us find the right matches for you.</p>
      </div>

      {/* Options Grid */}
      <div className={styles.cardContainer}>
        {options.map((option) => (
          <div
            key={option.id}
            className={`${styles.genderCard} ${selectedGender === option.id ? styles.selected : ''}`}
            onClick={() => setSelectedGender(option.id)}
          >
            <span className={styles.label}>{option.label}</span>
            <div className={styles.checkIcon}></div>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <button 
        className={`${styles.nextButton} ${selectedGender ? styles.activeButton : ''}`}
        onClick={handleContinue}
        disabled={!selectedGender || loading}
      >
        {loading ? "Saving..." : "Continue"}
      </button>

    </div>
  );
};

export default GenderSelect;