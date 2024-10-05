import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { decode } from 'he';
import styles from './styles';
import { QuestionCard } from './QuestionCard';

// Shuffles an array. Taken from: https://www.geeksforgeeks.org/how-to-shuffle-the-elements-of-an-array-in-javascript/
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function Quiz() {
  // Stores the current index of the question
  const [questionIndex, setQuestionIndex] = useState(0);
  
  // This will contain a set of questions to be used
  const [questions, setQuestions] = useState([]);

  // This will store the alternative the user chooses
  const [pickedAlternative, setAlternative] = useState();

  // State to store the token
  const [token, setToken] = useState(null);

  // Token generation function
  async function generateToken() {
    try {
      const response = await fetch('https://opentdb.com/api_token.php?command=request');
      const data = await response.json();
      if (data.response_code === 0) {
        setToken(data.token);  // Save the token in state
        console.log('Token generated:', data.token);
      } else {
        console.error('Error generating token');
      }
    } catch (error) {
      console.error('Error in generateToken:', error);
    }
  }

  // Fetches a set of questions from opentdb.com and initializes a game state
  async function generateQuiz() {
    if (!token) {
      console.error('No token available. Please generate a token first.');
      return;
    }

    try {
      const response = await fetch(`https://opentdb.com/api.php?amount=10&token=${token}`);
      const data = await response.json();

      // If the token is expired (response_code === 4), regenerate it
      if (data.response_code === 4) {
        console.warn('Token expired, regenerating token...');
        await generateToken();
        await generateQuiz();  // Retry with the new token
        return;
      }

      // If questions are fetched successfully
      if (data.response_code === 0) {
        const questions = data.results.map(({ question, correct_answer, incorrect_answers }) => {
          const alternatives = shuffleArray([...incorrect_answers, correct_answer])
            .map(alternative => decode(alternative));

          return {
            question: decode(question),
            alternatives,
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

  // Initiates the game when loading the Quiz for the first time
  useEffect(() => {
    // First, generate the token
    generateToken();
  }, []);

  // Once the token is available, fetch the quiz
  useEffect(() => {
    if (token && questions.length === 0) {
      generateQuiz();  
    }
  }, [token]);  // Triggered when the token is set

  // This function sets the chosen alternative, waits for a moment, and then moves to the next question.
  function pickAnswer(alternative) {
    setAlternative(alternative);

    // Waiting for 2 seconds before moving on to next question
    setTimeout(() => {
      // Clear the alternative to make the question card editable again
      setAlternative(undefined);

      // Move on to the next question if there are any left
      if (questionIndex < questions.length - 1) {
        setQuestionIndex(questionIndex + 1);
      }
    }, 2000);
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {questions.length > 0 && (
          <QuestionCard
            questionIndex={questionIndex}
            questionData={questions[questionIndex]}
            pickedAlternative={pickedAlternative}
            onPickAlternative={pickAnswer}
          />
        )}
      </View>
    </View>
  );
}
