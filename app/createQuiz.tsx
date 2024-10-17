import { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import styles from './styles';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

// This is the form in the beginning of the quiz.
// You can choose the game difficulty and category.

// Limited set of categories made available for the user
const categories = [
  { id: 0, name: 'All' },
  { id: 10, name: 'Books' },
  { id: 11, name: 'Films' },
  { id: 12, name: 'Music' },
  { id: 14, name: 'Television' },
  { id: 17, name: 'Science & Nature' },
  { id: 18, name: 'Computers' },
  { id: 19, name: 'Mathematics' },
  { id: 21, name: 'Sports' },
  { id: 22, name: 'Geography' },
  { id: 23, name: 'History' },
];

const numberOfQuestions = 10;

export default function CreateQuiz() {
  // State for difficulty
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  // State for number of questions
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);

  let music; // Local variable to store the sound instance

  // Function to play the music
  const playMusic = async () => {
    try {
      console.log('Loading Sound');
      const { sound: newMusic } = await Audio.Sound.createAsync(
        require('../assets/sounds/leaderboard.wav')
      );
      music = newMusic; // Store the sound instance in the local variable
      await music.setIsLoopingAsync(true); // Loop the sound
      console.log('Playing Sound');
      await music.playAsync(); // Start playing the sound
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  // Function to stop and unload the music
  const stopMusic = async () => {
    if (music) {
      try {
        console.log('Stopping and unloading music');
        await music.stopAsync();    // Stop the sound
        await music.unloadAsync();  // Unload to free resources
        music = null;               // Clear the sound reference
      } catch (error) {
        console.error('Error stopping/unloading sound:', error);
      }
    }
  };

  // Manage play/stop based on screen focus
  useFocusEffect(
    useCallback(() => {
      playMusic(); // Play music when the screen gains focus

      return () => {
        stopMusic(); // Stop and unload music when the screen loses focus
      };
    }, []) // Empty dependency array ensures effect only runs on focus/blur
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Create a Quiz</Text>

        {/* Picker to choose a difficulty for the quiz */}
        <Text style={styles.title2}>Difficulty</Text>
        <Picker
            style={styles.picker}
            selectedValue={selectedDifficulty}
            onValueChange={(itemValue) =>
              setSelectedDifficulty(itemValue)
        }>
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
        </Picker>

        {/* Picker to choose the category of questions for the quiz */}
        <Text style={styles.title2}>Category</Text>
        <Picker
          style={styles.picker}
          selectedValue={selectedCategoryId}
          onValueChange={(itemValue) => setSelectedCategoryId(itemValue)}
        >          
          {categories.map(({ id, name }) => (<Picker.Item key={id} label={name} value={id} />  ))}
        </Picker>

        {/* A button for starting a quiz. Basically a link to the quiz route with given parameters */}
        <View style={styles.startButtonContainer}>
          <View style={styles.button}>
            <Link
              style={styles.buttonText}
              href={{
                pathname: '/quiz',
                params: { difficulty: selectedDifficulty, numberOfQuestions, categoryId: selectedCategoryId }
              }}>
                    Start game
            </Link>
          </View>
        </View>        
      </View>
    </View>      
  )
}

;