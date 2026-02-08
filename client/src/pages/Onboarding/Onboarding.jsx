// src/pages/Onboarding/Onboarding.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Onboarding.module.css';

// Placeholder data - replace image URLs with your actual assets
const slides = [
  {
    id: 1,
    image: "https://res.cloudinary.com/dbxtgjwyv/image/upload/v1770531802/one_rbhl9j.png", // 3D Couple illustration
    title: "Find your partner with us",
    desc: "We know it can be shy to socialize with the opposite gender. That's exactly why we built the perfect solution for you."
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/dbxtgjwyv/image/upload/v1770531802/two_hpve6q.png", 
    title: "Chat instantly with matches",
    desc: "Connect with people who share your interests and vibe instantly."
  },
  {
    id: 3,
    image: "https://res.cloudinary.com/dbxtgjwyv/image/upload/v1770532337/three_s3elmm.png", 
    title: "End to End encrypted chats!",
    desc: "Don't worry for your messages, We have your back with end to end encryption for messages"
  }
];

const Onboarding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Navigate to Auth/Login page when finished
      navigate('/login'); 
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Half: 3D Image */}
      <div className={styles.imageSection}>
        <img 
          src={slides[currentIndex].image} 
          alt="Illustration" 
          className={styles.image} 
        />
      </div>

      {/* Bottom Half: White Card */}
      <div className={styles.card}>
        <h2 className={styles.title}>
          {slides[currentIndex].title}
        </h2>
        
        <p className={styles.description}>
          {slides[currentIndex].desc}
        </p>

        {/* Carousel Indicators */}
        <div className={styles.pagination}>
          {slides.map((_, index) => (
            <div 
              key={index} 
              className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button className={styles.nextButton} onClick={handleNext}>
          {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;