import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Questions.module.css';

// Updated Data with 'type'
const questionsData = [
  {
    id: 1,
    type: 'selection',
    text: "What kind of relationship are you looking for?",
    description: "Select one.",
    options: [
      "Looking for a serious, long-term relationship.",
      "Something meaningful or \"seeing where it goes.\"",
      "Casual dating, hanging out, and no strings attached.",
      "Purely platonic."
    ]
  },
  {
    id: 2,
    type: 'selection',
    text: "Choose your communication personality:",
    description: "Select one.",
    options: [
      "Call Commander",
      "Voice Note Ninja",
      "Typing Titan"
    ]
  },
  {
    id: 3,
    type: 'selection',
    text: "When are you most alive?",
    description: "Select one.",
    options: [
      "Night owl",
      "Morning person",
      "Somewhere in between"
    ]
  },
  {
    id: 4,
    type: 'selection',
    text: "What date appeals the most to you?",
    description: "Select one.",
    options: [
      "Staying in, ordering food and watching a movie.",
      "Going to a concert or DJ night.",
      "A pleasant restaurant date.",
      "Playing games together."
    ]
  },
  {
    id: 5,
    type: 'selection',
    text: "What's your comfort zone?",
    description: "Select one.",
    options: [
      "Food and Netflix.",
      "An evening of your favourite sport.",
      "A cozy sleep.",
      "A long talk/vent with your friends.",
      "Dancing to your favourite tunes",
      "Sketching/painting",
      "Floating through playlists.",
      "Bringing out your inner chef."
    ]
  },
  {
    id: 6,
    type: 'selection',
    text: "What attracts you the most?",
    description: "Select one.",
    options: [
      "Kindness",
      "Compassion",
      "Confidence",
      "A good sense of humour",
      "Emotional Maturity",
      "Ambition",
      "Passion",
      "Intelligence",
      "Empathy"
    ]
  },
  {
    id: 7,
    type: 'selection',
    text: "What is your social personality closest to?",
    description: "Select one.",
    options: [
      "Social Butterfly.",
      "Life of the party.",
      "Energetic soul.",
      "Humour Hunter.",
      "Selective socializer.",
      "Scared socially.",
      "Solitude > Social presence."
    ]
  },
  {
    id: 8,
    type: 'selection',
    text: "What does your ideal vacation look like?",
    description: "Select one.",
    options: [
      "Beaches",
      "Hike to the mountains",
      "Exploring cities",
      "Anything works, I just need a vacation.",
      "What's vacation? I'm staying in."
    ]
  },
  {
    id: 9,
    type: 'selection',
    text: "What are your biggest turn offs?",
    description: "Select one.",
    options: [
      "Ghosting",
      "Disrespect",
      "Dry replies",
      "Over possessiveness",
      "Emotional Unavailability",
      "Raising voice"
    ]
  },
  {

    id: 10,

    type: 'text', // Descriptive

    text: "Which movie character resembles you the most?",

    description: "Describe it in a few words.",

    placeholder: "e.g., Ironman"

  },


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