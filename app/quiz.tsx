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

const maximumTimeToAnswerInMilliseconds = 20000;

const maxPointsForAnswer = {
  easy: 700,
  medium: 850,
  hard: 1000,
};

// Calculates the number of points based on the difficulty of question and time which elapsed during answering.
function calculatePoints(answerTimeInMilliSeconds, questionDifficulty) {
  if (answerTimeInMilliSeconds >= maximumTimeToAnswerInMilliseconds) {
    return 0;
  }

  // Calculating, how many percent of the maximum answer time was elapsed and subtracting the same proportion from maximum points.
  // For example if maximum time is 5000 milliseconds and answer time was 1000 milliseconds, subtracting 20 percent from the maximum points.
  const answerTimeCoefficient = 1.0 - (answerTimeInMilliSeconds / maximumTimeToAnswerInMilliseconds)
  const maxPoints = maxPointsForAnswer[questionDifficulty];
  
  return Math.round(maxPoints * answerTimeCoefficient); // Rounding the result to integers
}

function getInitialAnswerTimeInSeconds() {
  return Math.round(maximumTimeToAnswerInMilliseconds / 1000);
}

export default function Quiz() {
  const { difficulty, numberOfQuestions, categoryId } = useLocalSearchParams();
  const context = useContext(TokenContext);

  // Assert that context is not null
  if (!context) {
    throw new Error('TokenContext must be used within a TokenProvider');
  }

  const { token, regenerateToken } = context;

  const [secondsLeft, setSecondsLeft] = useState(getInitialAnswerTimeInSeconds());
  const [playerPoints, setPlayerPoints] = useState(0); // State to have the points player has got
  const [answerPoints, setAnswerPoints] = useState(0); // State to have the points had from the current question
  const [questionAskedAt, setQuestionAskedAt] = useState(new Date());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [pickedAlternative, setAlternative] = useState(null);
  const [showResult, setShowResult] = useState(false); // State to show result of answer
  const [showTimeout, setShowTimeout] = useState(false); // State to show the timeout message

  console.log('Accessing token from context:', token);

  // Waits for 2 seconds and then clears UI and shows the next question
  function moveOnToNextQuestion() {
    setTimeout(() => {
      if (questionIndex < questions.length - 1) {
        setQuestionIndex((prevIndex) => prevIndex + 1);
      } else {
        console.log('Quiz Finished!');
        console.log('Player points ', playerPoints);
      }

      // Initializing the state for the next question
      setSecondsLeft(getInitialAnswerTimeInSeconds());
      setAlternative(null);
      setShowResult(false);
      setShowTimeout(false);
      setQuestionAskedAt(new Date());
    }, 2000); // Show result for 2 second before proceeding to the next question
  }

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
        const questions = data.results.map(({ question, correct_answer, incorrect_answers, difficulty }) => {
          let alternatives = [...incorrect_answers, correct_answer];
          alternatives = shuffleArray(alternatives);

          return {
            question: decode(question),
            alternatives: alternatives.map(alternative => decode(alternative)),
            correctAlternative: decode(correct_answer),
            difficulty,
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

  // Functionality to show timeout text and correct alternative if maximum time has been elapsed.
  useEffect(() => {
    // Function inside interval is run every 200 milliseconds
    const interval = setInterval(() => {

      // Calculating the time elapsed after the question was asked
      const timeElapsedInMilliseconds = new Date().getTime() - questionAskedAt.getTime();

      // If player has already picked an answer, disabling timeout mechanism
      if (pickedAlternative != null) {
        clearInterval(interval);
        return;
      }

      // Do nothing if there is still time to pick an answer
      if (timeElapsedInMilliseconds <= maximumTimeToAnswerInMilliseconds) {

        // Calculating time left and updating it to UI if needed
        const timeLeftInSeconds = Math.round((maximumTimeToAnswerInMilliseconds - timeElapsedInMilliseconds) / 1000);
        if (timeLeftInSeconds !== secondsLeft) {          
          setSecondsLeft(timeLeftInSeconds)
        }
        return;
      }

      // Show the correct answer to the player (and also disable the UI for a few seconds)
      setAlternative(questions[questionIndex].correctAlternative);
      setShowTimeout(true);
      moveOnToNextQuestion();

      // After timeout there is no need to run this code anymore.
      clearInterval(interval);
    }, 100);

    // Returning cleanup function for effect which clears the interval
    return () => clearInterval(interval);
  }, [questionAskedAt, questions, pickedAlternative]);

  useEffect(() => {
    if (token && questions.length === 0) {
      generateQuiz();
    }
  }, [token]);

  // Function to handle selecting an answer
  const pickAnswer = (alternative) => {
    if (pickedAlternative !== null) return; // Prevent selecting another answer if already answered

    setAlternative(alternative);
    const isAnswerCorrect = alternative === questions[questionIndex].correctAlternative;

    // Show the result for a short period before moving to the next question
    setShowResult(true);

    const answerTimeInMilliSeconds = new Date().getTime() - questionAskedAt.getTime();

    if (isAnswerCorrect) {
      const answerPoints = calculatePoints(answerTimeInMilliSeconds, questions[questionIndex].difficulty);
      setAnswerPoints(answerPoints);
      setPlayerPoints(currentPoints => currentPoints + answerPoints);
    }
    
    moveOnToNextQuestion();
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
              <Text>Time left: {secondsLeft}</Text>
              {showResult && (
                <View>
                  <Text style={styles.resultText}>
                    {pickedAlternative === questions[questionIndex].correctAlternative ? "Correct!" : "Incorrect!"}
                  </Text>
                  {pickedAlternative === questions[questionIndex].correctAlternative && (
                    <Text>You got {answerPoints} points.</Text>
                  )}
                </View>
              )}
              {showTimeout && (
                <Text style={{ fontWeight: 'bold' }}>Time's up!</Text>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}
