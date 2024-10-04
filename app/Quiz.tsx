import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { decode } from 'he';
import styles from './styles';
import { QuestionCard } from './QuestionCard';


// Shuffles an array. Taken from: https://www.geeksforgeeks.org/how-to-shuffle-the-elements-of-an-array-in-javascript/
function shuffleArray(array) {
  for (let i = array.length - 1; i < 0; i--) {
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

  // Fetches a set of questions from opentdb.com and initializes a game state
  async function generateQuiz() {
    const response = await fetch('https://opentdb.com/api.php?amount=10');
    const data = await response.json();

    // Transformes data from opentdb into format which application uses
    const questions = data.results
      .map(({ question, correct_answer, incorrect_answers}) => {

        // Shuffles array so that incorrect array is not always in same place.
        // Also decodes data which has HTML encoded values like &quot;
        const alternatives = shuffleArray([...incorrect_answers, correct_answer])
          .map(alternative => decode(alternative));

        // Decoding question and correct_answer as well.
        return ({
          question: decode(question),
          alternatives,
          correctAlternative: decode(correct_answer),
      })
      });

    // Setting ready questions to state
    setQuestions(questions);
  }

  // Initiales the game when loading the Quiz for the first time
  useEffect(() => {
    if (questions.length === 0) {
      generateQuiz();  
    }
  }, []);

  // This function sets chosen alternative, waits for a moment and then
  // moves on to the next question.
  function pickAnswer(alternative) {
    setAlternative(alternative);

    // Waiting for 2 seconds before moving on to next question
    setTimeout(() => {
      // Clearing alternative in order to make question card editable again
      setAlternative(undefined);

      // Moving on only when there are questions left
      if (questionIndex < questions.length - 1) {
        setQuestionIndex(questionIndex + 1);
      }
    }, 2000);
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {questions.length > 0 && <QuestionCard
          questionIndex={questionIndex}
          questionData={questions[questionIndex]}
          pickedAlternative={pickedAlternative}
          onPickAlternative={pickAnswer}
        />}        
      </View>
    </View>
  );
};
