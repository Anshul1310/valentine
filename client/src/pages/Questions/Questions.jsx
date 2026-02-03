// src/pages/Questions/Questions.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you use react-router
import styles from './Questions.module.css';

// 1. Placeholder Data (10 Questions)
const questionsData = [
  {
    id: 1,
    text: "What's your primary goal here?",
    description: "This helps us show you the right people.",
    options: ["Serious Relationship", "Casual Dating", "Making Friends", "Not Sure Yet"]
  },
  {
    id: 2,
    text: "What's your gender?",
    description: "Select the one that best describes you.",
    options: ["Man", "Woman", "Non-binary", "More"]
  },
  {
    id: 3,
    text: "Who are you interested in?",
    description: "You can change this later in settings.",
    options: ["Men", "Women", "Everyone"]
  },
  // ... Add 7 more dummy objects here for the full 10
  { id: 4, text: "Question 4 Placeholder", description: "Description for Q4", options: ["Option A", "Option B"] },
  { id: 5, text: "Question 5 Placeholder", description: "Description for Q5", options: ["Option A", "Option B"] },
  { id: 6, text: "Question 6 Placeholder", description: "Description for Q6", options: ["Option A", "Option B"] },
  { id: 7, text: "Question 7 Placeholder", description: "Description for Q7", options: ["Option A", "Option B"] },
  { id: 8, text: "Question 8 Placeholder", description: "Description for Q8", options: ["Option A", "Option B"] },
  { id: 9, text: "Question 9 Placeholder", description: "Description for Q9", options: ["Option A", "Option B"] },
  { id: 10, text: "Final Question", description: "Almost done!", options: ["Yes", "No"] },
];

const Questions = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // Store answers by Question ID
  const navigate = useNavigate();

  const currentQuestion = questionsData[currentIndex];
  
  // Check if the current question has an answer selected
  const selectedAnswer = answers[currentQuestion.id];

  const handleSelect = (option) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: option
    }));
  };

  const handleNext = () => {
    if (currentIndex < questionsData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      console.log("All Answers:", answers);
      // Navigate to the next big step (e.g., Descriptive Questions or Main Feed)
      // navigate('/description-questions'); 
    }
  };

  return (
    <div className={styles.container}>
      
      {/* 1. Header: Segmented Progress Bar */}
      <div className={styles.header}>
        <div className={styles.progressBar}>
          {questionsData.map((_, index) => (
            <div 
              key={index} 
              className={`${styles.progressSegment} ${index <= currentIndex ? styles.activeSegment : ''}`}
            />
          ))}
        </div>
        <div className={styles.headerText}>
          <span>Step {currentIndex + 1}</span>
          <span>{questionsData.length} Total</span>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className={styles.content}>
        <h2 className={styles.questionTitle}>{currentQuestion.text}</h2>
        <p className={styles.questionDescription}>{currentQuestion.description}</p>

        <div className={styles.optionsList}>
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`${styles.optionCard} ${selectedAnswer === option ? styles.selectedOption : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Sticky Footer */}
      <div className={styles.footer}>
        <p className={styles.disclaimer}>
          We won't share your answer publicly.
        </p>
        <button 
          className={`${styles.nextButton} ${selectedAnswer ? styles.activeButton : ''}`}
          disabled={!selectedAnswer}
          onClick={handleNext}
        >
          {currentIndex === questionsData.length - 1 ? "Finish" : "Next"}
        </button>
      </div>

    </div>
  );
};

export default Questions;