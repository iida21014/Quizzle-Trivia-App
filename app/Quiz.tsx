import { useState } from 'react';
import { View } from 'react-native';
import styles from './styles';
import { QuestionCard } from './QuestionCard';

export default function Quiz() {
  // Stores the current index of the question
  const [questionIndex, setQuestionIndex] = useState(0);
  
  // This will contain a set of questions to be used
  // TODO: Replace this with Trivia database API
  const [questions, setQuestions] = useState([{
    question: 'What is the name of the Mobile Programming course teacher?',
    alternatives: [
      'Pentti',
      'Antti',
      'Risto',
      'Rauno',
    ],
    correctAlternative: 'Pentti',
  }]);

  // This will store the alternative the user chooses
  const [pickedAlternative, setAlternative] = useState();

  // This function sets chosen alternative, waits for a moment and then
  // moves on to the next question.
  function pickAnswer(alternative) {
    setAlternative(alternative);
    setTimeout(() => {
      // Clearing alternative in order to make question card editable again
      setAlternative(undefined);

      // TODO: Choose next question etc.
    }, 2000);
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <QuestionCard
          questionIndex={0}
          questionData={questions[questionIndex]}
          pickedAlternative={pickedAlternative}
          onPickAlternative={pickAnswer}
        />
      </View>
    </View>
  );
};
