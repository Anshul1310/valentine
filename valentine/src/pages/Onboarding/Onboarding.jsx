// src/pages/Onboarding/Onboarding.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Onboarding.module.css';

// Placeholder data - replace image URLs with your actual assets
const slides = [
  {
    id: 1,
    image: "https://cdn3d.iconscout.com/3d/premium/thumb/couple-in-love-5462557-4550672.png", // 3D Couple illustration
    title: "Find your partner with us",
    desc: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint."
  },
  {
    id: 2,
    image: "https://cdn3d.iconscout.com/3d/premium/thumb/chatting-couple-2937684-2426384.png", 
    title: "Chat instantly with matches",
    desc: "Connect with people who share your interests and vibe instantly."
  },
  {
    id: 3,
    image: "https://cdn3d.iconscout.com/3d/premium/thumb/dating-app-match-2937691-2426391.png", 
    title: "It's a Match!",
    desc: "Start your journey today and find the one you've been looking for."
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