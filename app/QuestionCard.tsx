import { useState, useEffect } from 'react';
import { Dimensions, View, Text, StyleSheet, Pressable  } from 'react-native';
import styles from './styles';

export function QuestionCard({ questionData, questionIndex, pickedAlternative, onPickAlternative }) {
  const { question, alternatives, correctAlternative } = questionData;
  
  // Function which composes the style of the button
  function getAlternativeStyle(alternative) {
    // When answer is not picked, app uses default styling
    if (pickedAlternative == null) {
      return cardStyles.questionAlternative;
    }

    // Making a copy of base style and modifying the copy if needed
    const cardStyle = { ...cardStyles.questionAlternative };

    if (alternative === correctAlternative) {
      // If alternative is the correct one, using green background
      cardStyle.backgroundColor = 'green';
      
    } else if (alternative === pickedAlternative && alternative !== correctAlternative) {
      // If alternative is picked one and not the correct one, using red.
      cardStyle.backgroundColor = 'red';
      
    }

    return cardStyle;
  }

  return (
    <View style={cardStyles.card}>
      <Text style={styles.title}>Question {questionIndex + 1}:</Text>
      <Text style={styles.title}>{question}</Text>

      {/* Rendering alternatives of a question */}
      {alternatives.map((alternative, index) => (
        <Pressable
          key={index}
          disabled={pickedAlternative != null} 
          style={getAlternativeStyle(alternative)}
          onPress={() => onPickAlternative(alternative)}
        >
          <Text style={cardStyles.questionAlternativeText}>{alternative}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// Getting screen dimensions in order to resize white background
// https://reactnative.dev/docs/dimensions
const screenDimensions = Dimensions.get('window');
const screenWidth = screenDimensions.width;
const screenHeight = screenDimensions.height;

const cardStyles = StyleSheet.create({
  card: {
    width: screenWidth - 90,
    height: screenHeight - 150,
  },
  questionAlternative: {
    borderColor: 'black',
    borderWidth: 1,
    padding: 5,
    marginBottom: 10,
    backgroundColor: '#e7e2f2',
  },
  questionAlternativeText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});