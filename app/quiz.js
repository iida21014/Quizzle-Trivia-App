import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { decode } from 'he';
import styles from './styles';
import { QuestionCard } from './QuestionCard';
import { TokenContext } from './TokenContext';
import TimeLeftBar from './TimeLeftBar';
import AnimatedText from './AnimatedText';
import { handleScreenMusic, playSound } from './soundManager'; // Import sound-related functions from soundManager

// Function to shuffle array (used in shuffling quiz answer alternatives). Taken from: https://www.geeksforgeeks.org/how-to-shuffle-the-elements-of-an-array-in-javascript/
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Number of right answers in row player has to get to earn bonus points:
const bonusLimit = 2;

// Time limit for answering to a question:
const maximumTimeToAnswerInMilliseconds = 20000; // Using milliseconds to calculate points more accurately.

// Max points for answer in each difficulty level:
const maxPointsForAnswer = {
  easy: 700,
  medium: 850,
  hard: 1000,
};

// Function to calculate the number of points based on the difficulty of question and time which elapsed during answering.
function calculatePoints(answerTimeInMilliSeconds, questionDifficulty) {
  // If user exceeds timelimit
  if (answerTimeInMilliSeconds >= maximumTimeToAnswerInMilliseconds) {
    return 0;
  }

  // Calculating, how many percent of the maximum answer time was elapsed and subtracting the same proportion from maximum points.
  // For example if maximum time is 5000 milliseconds and answer time was 1000 milliseconds, subtracting 20 percent from the maximum points.
  const answerTimeCoefficient =
    1.0 - answerTimeInMilliSeconds / maximumTimeToAnswerInMilliseconds;

  const maxPoints = maxPointsForAnswer[questionDifficulty];

  return Math.round(maxPoints * answerTimeCoefficient); // Rounding the result to integers
}

// Function to return initial (maximum) time to answer in seconds
function getInitialAnswerTimeInSeconds() {
  return Math.round(maximumTimeToAnswerInMilliseconds / 1000);
}

export default function Quiz() {
  const context = useContext(TokenContext);
  const router = useRouter();

  // Assert that context is not null
  if (!context) {
    throw new Error('TokenContext must be used within a TokenProvider');
  }
  const { token, regenerateToken } = context;

  const { difficulty, numberOfQuestions, categoryId } = useLocalSearchParams(); // Options from createQuiz
  const [secondsLeft, setSecondsLeft] = useState(
    getInitialAnswerTimeInSeconds()
  );
  const [playerPoints, setPlayerPoints] = useState(0); // State for the points player has got in whole quiz
  const [answerPoints, setAnswerPoints] = useState(0); // State for the points had from the single question
  const [correctAnswersInARow, setCorrectAnswersInARow] = useState(0);
  const [questionAskedAt, setQuestionAskedAt] = useState(new Date());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [pickedAlternative, setAlternative] = useState(); // State for picked alternative (not selected anything as default)
  const [revealCorrectAnswer, setRevealCorrectAnswer] = useState(false); // State to show correct answer for the user

  // Music and sounds:
  const sounds = {
    correct: require('../assets/sounds/correct.wav'),
    incorrect: require('../assets/sounds/incorrect.wav'),
    quizMusic: require('../assets/sounds/gameMusic.wav'), // Add your quiz music file here
  };

  handleScreenMusic(sounds.quizMusic); // This will handle music play/stop on screen focus

  // Function to wait 2 seconds and then clear UI and show the next question.
  // End game after the last question.
  function moveOnToNextQuestion() {
    setTimeout(() => {
      if (questionIndex < questions.length - 1) {
        setQuestionIndex((index) => index + 1);
      } else {
        // Game over
        router.replace({
          // Using replace because we don't want user to navigate back to the game which has ended.
          pathname: '/quizResult', // Navigating to result page and passing category and points as parameters.
          params: {
            totalPoints: playerPoints,
            categoryId,
          },
        });
        return;
      }

      // Initializing the state for the next question
      setSecondsLeft(getInitialAnswerTimeInSeconds());
      setAlternative(null);
      setRevealCorrectAnswer(false);
      setQuestionAskedAt(new Date());
    }, 2000); // Wait for 2 seconds before proceeding to the next question
  }

  // Function to fetch questions from Open Trivia DB and initialize the game
  async function generateQuiz() {
    if (!token) {
      console.error('No token available. Please generate a token first.');
      return;
    }

    try {
      // Url to the Open Trivia Database
      let url = `https://opentdb.com/api.php?amount=${numberOfQuestions}&difficulty=${difficulty}&token=${token}`;

      // If category id is not 0 (All) it added to the url as query parameter
      if (categoryId !== '0') {
        url += `&category=${categoryId}`;
      }

      // Fetch the questions from database
      const response = await fetch(url);
      const data = await response.json();

      if (data.response_code === 4) {
        console.warn('Token expired, regenerating token...');
        await regenerateToken();
        return;
      }

      // If response code is 0, use fetched questions in game
      if (data.response_code === 0) {
        // Transformes response from Open Trivia DB for the game.  Also decode HTML escaped strings to show them correctly in UI.
        const questions = data.results.map(
          ({ question, correct_answer, incorrect_answers, difficulty }) => {
            // Combine incorrect and correct answers into one array and shuffle.
            let alternatives = [...incorrect_answers, correct_answer];
            alternatives = shuffleArray(alternatives);

            // Decode HTML escaped strings so that questions and alternatives are shown correctly in UI
            return {
              question: decode(question),
              alternatives: alternatives.map((alternative) =>
                decode(alternative)
              ),
              correctAlternative: decode(correct_answer),
              difficulty,
            };
          }
        );

        // Question is being shown right after this moment so setting the start timestamp here
        setQuestionAskedAt(new Date());
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
    // Function inside interval is run every 100 milliseconds (0,1 seconds)
    const interval = setInterval(() => {
      // Calculating the time elapsed after the question was asked (difference between current moment and moment when question was asked)
      const timeElapsedInMilliseconds =
        new Date().getTime() - questionAskedAt.getTime();

      // If player has already picked an answer, disabling timeout mechanism
      if (pickedAlternative != null) {
        clearInterval(interval);
        return;
      }

      // Do nothing if there is still time to pick an answer
      if (timeElapsedInMilliseconds <= maximumTimeToAnswerInMilliseconds) {
        // Calculating time left and updating it to UI in seconds if needed
        const timeLeftInSeconds = Math.round(
          (maximumTimeToAnswerInMilliseconds - timeElapsedInMilliseconds) / 1000
        );
        if (timeLeftInSeconds !== secondsLeft) {
          setSecondsLeft(timeLeftInSeconds);
        }
        return;
      } else {
        // What happens when user doesn't answer the question withing given time:
        // After timeout there is no need for interval
        clearInterval(interval);

        // Show the correct answer to the player (and also disable the UI for a few seconds)
        setAlternative(questions[questionIndex].correctAlternative);

        // Move to the next question
        moveOnToNextQuestion();
      }
    }, 100); // interval in every 100 milliseconds

    // Returning cleanup function for effect which clears the interval
    return () => clearInterval(interval);
  }, [questionAskedAt, questions, pickedAlternative]);

  // Generating quiz
  // Tries to generate questions again if token changes (e.g. expiring token) and there are no questions in state
  useEffect(() => {
    if (token && questions.length === 0) {
      generateQuiz();
    }
  }, [token]);

  // Function to handle selecting an answer
  const pickAnswer = (alternative) => {
    // Prevent selecting another answer if already answered
    if (pickedAlternative != null) {
      return;
    }

    setAlternative(alternative);
    const isAnswerCorrect =
      alternative === questions[questionIndex].correctAlternative; // True if selected alternative is correct

    // Show the result before moving to the next question
    setRevealCorrectAnswer(true);

    // Calculate answer time for current question
    const answerTimeInMilliSeconds =
      new Date().getTime() - questionAskedAt.getTime();

    // Play sound for correct answer
    if (isAnswerCorrect) {
      playSound(sounds.correct);

      // If there are enough correct answers in a row, add bonus points
      const currentCorrectAnswersInARow = correctAnswersInARow + 1;
      let bonusPoints = 0;
      if (currentCorrectAnswersInARow >= bonusLimit) {
        bonusPoints += currentCorrectAnswersInARow * 100; // E.g, 3 answers in row makes 300 points
      }

      // Points for the current answer calculated with basic points and bonus points
      const answerPoints =
        calculatePoints(
          answerTimeInMilliSeconds,
          questions[questionIndex].difficulty
        ) + bonusPoints;
      setAnswerPoints(answerPoints);

      // Change the number of correct answers in row
      setCorrectAnswersInARow((oldValue) => oldValue + 1);

      // Add points from current answer to the total points (player points)
      setPlayerPoints((currentPoints) => currentPoints + answerPoints);
    } else {
      // If answer is wrong, reset correctAnswersInRow and play sound of incorrect answer
      setCorrectAnswersInARow(0);
      playSound(sounds.incorrect);
    }

    moveOnToNextQuestion();
  };

  return (
    <View style={styles.container}>
      {!token ? (
        <Text>Loading...</Text>
      ) : (
        <View style={styles.contentContainerFull}>
          {questions.length > 0 && (
            <>
              <TimeLeftBar
                timeLeft={secondsLeft}
                maximumTime={getInitialAnswerTimeInSeconds()}
              />
              <QuestionCard
                questionIndex={questionIndex}
                questionData={questions[questionIndex]}
                pickedAlternative={pickedAlternative}
                onPickAlternative={pickAnswer}
                numberOfQuestions={questions.length}
              />
              {revealCorrectAnswer && (
                <View style={styles.answerResultContainer}>
                  <AnimatedText style={styles.animatedText}>
                    {pickedAlternative ===
                    questions[questionIndex].correctAlternative
                      ? 'Correct!'
                      : 'Incorrect!'}
                  </AnimatedText>
                  {pickedAlternative ===
                    questions[questionIndex].correctAlternative && (
                    <AnimatedText style={styles.animatedText}>
                      You got {answerPoints} points.
                    </AnimatedText>
                  )}
                  {correctAnswersInARow >= bonusLimit && (
                    <AnimatedText style={styles.correctAnswersInARowText}>
                      🎉 {correctAnswersInARow} answers in a row! 🎉
                    </AnimatedText>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}
