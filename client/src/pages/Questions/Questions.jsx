import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Questions.module.css';

// Updated Data with 'type'
const questionsData = [
  {
    id: 1,
    type: 'selection', // Multiple Choice
    text: "What's your primary goal here?",
    description: "Select all that apply.",
    options: ["Serious Relationship", "Casual Dating", "Making Friends", "Not Sure Yet"]
  },
  {
    id: 2,
    type: 'text', // Descriptive
    text: "What's your ideal first date?",
    description: "Describe it in a few words.",
    placeholder: "e.g., Coffee at a quiet cafe..."
  },
  {
    id: 3,
    type: 'selection',
    text: "What are your interests?",
    description: "Pick as many as you like.",
    options: ["Music", "Sports", "Gaming", "Travel", "Food", "Art"]
  },
  {
    id: 4,
    type: 'text',
    text: "One thing you can't live without?",
    description: "Be honest!",
    placeholder: "e.g., My headphones"
  }
];

const Questions = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // State structure: { 1: ["Option A"], 2: "My text answer" }
  const [answers, setAnswers] = useState({}); 
  const navigate = useNavigate();

  const currentQuestion = questionsData[currentIndex];
  const currentAnswer = answers[currentQuestion.id];

  // Handle Selection (Array)
  const handleSelect = (option) => {
    setAnswers(prev => {
      const existing = Array.isArray(prev[currentQuestion.id]) ? prev[currentQuestion.id] : [];
      if (existing.includes(option)) {
        return { ...prev, [currentQuestion.id]: existing.filter(item => item !== option) };
      } else {
        return { ...prev, [currentQuestion.id]: [...existing, option] };
      }
    });
  };

  // Handle Text Input (String)
  const handleTextChange = (e) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: e.target.value
    }));
  };

  const handleNext = async () => {
    if (currentIndex < questionsData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Submit Data
      try {
        const token = localStorage.getItem('authToken');
        
        // Transform state to backend schema
        const formattedAnswers = questionsData.map(q => {
          const ans = answers[q.id];
          if (q.type === 'selection') {
            return { 
              questionId: q.id, 
              questionType: 'selection', 
              selectedOptions: ans || [] 
            };
          } else {
            return { 
              questionId: q.id, 
              questionType: 'text', 
              textAnswer: ans || "" 
            };
          }
        });

        await axios.post('/api/user/answers', 
          { answers: formattedAnswers },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        navigate('/terms');

      } catch (error) {
        console.error("Failed to save answers", error);
        alert("Something went wrong saving your answers.");
      }
    }
  };

  // Helper to check if "Next" button should be enabled
  const canProceed = () => {
    if (currentQuestion.type === 'selection') {
      return currentAnswer && currentAnswer.length > 0;
    }
    if (currentQuestion.type === 'text') {
      return currentAnswer && currentAnswer.trim().length > 0;
    }
    return false;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.progressBar}>
          {questionsData.map((_, index) => (
            <div 
              key={index} 
              className={`${styles.progressSegment} ${index <= currentIndex ? styles.activeSegment : ''}`}
            />
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.questionTitle}>{currentQuestion.text}</h2>
        <p className={styles.questionDescription}>{currentQuestion.description}</p>

        {/* Render based on Type */}
        {currentQuestion.type === 'selection' ? (
          <div className={styles.optionsList}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(option);
              return (
                <button
                  key={index}
                  className={`${styles.optionCard} ${isSelected ? styles.selectedOption : ''}`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        ) : (
          <div className={styles.textInputContainer}>
            <textarea 
              className={styles.textArea}
              placeholder={currentQuestion.placeholder}
              value={currentAnswer || ''}
              onChange={handleTextChange}
              rows={4}
            />
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button 
          className={`${styles.nextButton} ${canProceed() ? styles.activeButton : ''}`}
          disabled={!canProceed()}
          onClick={handleNext}
        >
          {currentIndex === questionsData.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default Questions;