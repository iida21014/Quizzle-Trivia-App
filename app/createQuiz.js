import { useState, useCallback, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import styles from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleScreenMusic} from './soundManager'; // Import sound-related functions from soundManager

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
  // Main view sets this flag when navigating so that previously saved options can be cleared
  const { clearOptions } = useLocalSearchParams();
  
  // State for difficulty
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  // State for number of questions
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);

  async function restoreOptions() {
    if (clearOptions) {
      await saveOptions(); // Saving default options from state into Async Storage
      return;
    }
    
    const options = await AsyncStorage.getItem('quizOptions');
    if (options == null) {
      return;
    }

    const { difficulty, categoryId } = JSON.parse(options);
    setSelectedDifficulty(difficulty);
    setSelectedCategoryId(categoryId);
  }

  async function saveOptions() {
    await AsyncStorage.setItem('quizOptions', JSON.stringify({ difficulty: selectedDifficulty, categoryId: selectedCategoryId }));
  }

  useEffect(() => {
    restoreOptions();
  }, []);


  // Saving options into Async Storage every time they are changed
  useEffect(() => {
    saveOptions();
  }, [selectedDifficulty, selectedCategoryId])

  const sounds = {
    allAroundMusic: require('../assets/sounds/allAround.wav'), // Add your quiz music file here
  };

  handleScreenMusic(sounds.allAroundMusic); // This will handle music play/stop on screen focus

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