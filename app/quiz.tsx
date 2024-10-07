import { useState, useEffect, useContext } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';
import { decode } from 'he';
import styles from './styles';
import { QuestionCard } from './QuestionCard';
import { TokenContext } from '../TokenContext';

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function Quiz() {
  const { difficulty, numberOfQuestions, categoryId } = useLocalSearchParams();
  const context = useContext(TokenContext);

  // Assert that context is not null
  if (!context) {
    throw new Error('TokenContext must be used within a TokenProvider');
  }

  const { token, regenerateToken } = context;

  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [pickedAlternative, setAlternative] = useState(null);
  const [showResult, setShowResult] = useState(false); // State to show result of answer

  console.log('Accessing token from context:', token);

  async function generateQuiz() {
    if (!token) {
      console.error('No token available. Please generate a token first.');
      return;
    }

    try {
      let url = `https://opentdb.com/api.php?amount=${numberOfQuestions}&token=${token}`;

      if (difficulty !== 'all') {
        url += `&difficulty=${difficulty}`;
      }

      if (categoryId !== '0') {
        url += `&category=${categoryId}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.response_code === 4) {
        console.warn('Token expired, regenerating token...');
        await regenerateToken();
        return;
      }

      if (data.response_code === 0) {
        const questions = data.results.map(({ question, correct_answer, incorrect_answers }) => {
          let alternatives = [...incorrect_answers, correct_answer];
          alternatives = shuffleArray(alternatives);

          return {
            question: decode(question),
            alternatives: alternatives.map(alternative => decode(alternative)),
            correctAlternative: decode(correct_answer),
          };
        });

        setQuestions(questions);
      } else {
        console.error('Error fetching quiz questions');
      }
    } catch (error) {
      console.error('Error in generateQuiz:', error);
    }
  }

  useEffect(() => {
    if (token && questions.length === 0) {
      generateQuiz();
    }
  }, [token]);

  // Function to handle selecting an answer
  const pickAnswer = (alternative) => {
    if (pickedAlternative !== null) return; // Prevent selecting another answer if already answered

    setAlternative(alternative);
    const isCorrect = alternative === questions[questionIndex].correctAlternative;

    // Show the result for a short period before moving to the next question
    setShowResult(true);
    setTimeout(() => {
      if (isCorrect) {
        console.log("Correct Answer!");
      } else {
        console.log("Incorrect Answer!");
      }
      
      // Move to the next question
      if (questionIndex < questions.length - 1) {
        setQuestionIndex((prevIndex) => prevIndex + 1);
      } else {
        console.log("Quiz Finished!");
      }

      // Clear the selected answer and result display
      setAlternative(null);
      setShowResult(false);
    }, 1000); // Show result for 1 second before proceeding to the next question
  };

  return (
    <View style={styles.container}>
      {!token ? (
        <Text>Loading...</Text>
      ) : (
        <View style={styles.contentContainerFull}>
          {questions.length > 0 && questionIndex != null && (
            <>
              <QuestionCard
                questionIndex={questionIndex}
                questionData={questions[questionIndex]}
                pickedAlternative={pickedAlternative}
                onPickAlternative={pickAnswer} // Pass the pickAnswer function
                numberOfQuestions={questions.length}
              />
              {showResult && (
                <Text style={styles.resultText}>
                  {pickedAlternative === questions[questionIndex].correctAlternative ? "Correct!" : "Incorrect!"}
                </Text>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}
