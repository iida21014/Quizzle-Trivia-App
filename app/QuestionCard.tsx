import { View, Text, StyleSheet, Pressable  } from 'react-native';
import styles from './styles';

export function QuestionCard({ questionData, questionIndex, pickedAlternative, onPickAlternative, numberOfQuestions }) {
  const { question, alternatives, correctAlternative } = questionData;
  
  // Function which composes the style of the button
  function getAlternativeStyle(alternative) {
    // When answer is not picked, app uses default styling
    if (pickedAlternative == null) {
      return styles.questionAlternative;
    }
    // Making a copy of base style and modifying the copy if needed
    const cardStyle = { ...styles.questionAlternative };
    if (alternative === correctAlternative) {
      // If alternative is the correct one, using green background
      cardStyle.backgroundColor = 'green';
    } else if (alternative === pickedAlternative && alternative !== correctAlternative) {
      // If alternative is picked one and not the correct one, using red.
      cardStyle.backgroundColor = 'darkred';
    }
    return cardStyle;
  }

    // Function which changes text colour in right and wrong alternatives
  function getAlternativeTextStyle(alternative) {
    // When answer is not picked, app uses default styling
    if (pickedAlternative == null) {
      return styles.questionAlternativeText;
    }
    // Making a copy of base style and modifying the copy if needed
    const alternativeText = {...styles.questionAlternativeText};
    if (alternative === correctAlternative) {
      alternativeText.color ='white';
      
    } else if (alternative === pickedAlternative && alternative !== correctAlternative) {
      alternativeText.color ='white';
    }
    return alternativeText;
  }

  return (
    <View>
      <Text style={styles.titleQuestion}>Question {questionIndex + 1} / {numberOfQuestions}:</Text>
      <Text style={{ ...styles.title2, textAlign: 'center'}}>{question}</Text>

      {/* Rendering alternatives of a question */}
      {alternatives.map((alternative, index) => (
        <Pressable
          key={index}
          disabled={pickedAlternative != null} 
          style={getAlternativeStyle(alternative)}
          onPress={() => onPickAlternative(alternative)}
        >
          <Text style={getAlternativeTextStyle(alternative)}>{alternative}</Text>
        </Pressable>
      ))}
    </View>
  );
}
