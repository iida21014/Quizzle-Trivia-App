import { useEffect, useState } from 'react';
import { View, Text, Alert, TouchableOpacity} from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import styles from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';

export default function QuizResult() {
  const { totalPoints, categoryId } = useLocalSearchParams();   // Reading game results which have been set by Quiz view when navigating here
  const [sound, setSound] = useState(null);
  const [username, setUsername] = useState('');
  const [ leaderboardPosition, setLeaderboardPosition ] = useState(null);   // State for showing leaderboard position
  const [ isPersonalRecord, setIsPersonalRecord ] = useState(false)   // State for showing personal record
  const router = useRouter();  // Initialize router

  // Paths to the sound files
  const sounds = {
    doubleScore: require('../assets/sounds/doubleScore.wav'),
    personal: require('../assets/sounds/personalRecord.mp3'),
    leaderboard: require('../assets/sounds/leaderboardScore.wav'),
    noRecord: require('../assets/sounds/noRecord.wav'),
  };  

  // Function to play sound effects (only one sound should play at a time)
  async function playSound(soundFile) {
    if (sound) {
      console.log('Stopping previous sound');
      await sound.stopAsync();
      await sound.unloadAsync(); // Unload previous sound
    }

    console.log('Loading sound:', soundFile);
    const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
    setSound(newSound);
    console.log('Playing sound');
    await newSound.playAsync();
  }

  // Cleanup function to unload the sound when the component unmounts
  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Fetch the username from AsyncStorage when the component mounts
  useEffect(() => {
    const getUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username'); // Retrieve username from storage
        if (storedUsername) {
          setUsername(storedUsername); // Set the username if found
        } else {
          Alert.alert('Sorry', "You are not logged in, so we couldn't save your score!");
        }
      } catch (error) {
        console.error('Error fetching username from storage:', error);
        Alert.alert('Error', 'An error occurred while fetching the username');
      }
    };

    getUsername();
  }, []); // Empty dependency array to ensure it runs once when the component mounts

  // Sends user points to backend and sets leaderboard results to the UI
  async function postPlayerPoints(username, score, category, ) {
    try {
      const response = await fetch('https://quizzleapp.lm.r.appspot.com/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Telling backend it's receiving json
        },
        body: JSON.stringify({
          username,
          score: parseInt(score, 10),     // Ensure score is an integer
          category: parseInt(category, 10), // Ensure category is an integer
        }),
      });

      if (!response.ok) {
        throw new Error('HTTP error! status: ${response.status}'); // Helps catching network errors or incorrect http status codes
      }

      const data = await response.json();
    // Process leaderboard and personal record from response
      console.log('Response data:', data);
      setLeaderboardPosition(data.leaderboardPosition);
      setIsPersonalRecord(data.isPersonalRecord);
    } catch (error) {
      console.error('Could not save leaderboard points', error);
    }
  }

  // When view initializes, sending game results to backend
  useEffect(() => {
    if (username && totalPoints && categoryId) {
      console.log('username:', username, 'totalPoints:', totalPoints, 'categoryId:', categoryId); // This is for debugging
      postPlayerPoints(username,totalPoints, categoryId);
    }
  }, [username, totalPoints, categoryId]); // Only run when username is fetched and totalPoints/categoryId are valid


  // Play sounds based on leaderboard position and personal record
  useEffect(() => {
    if (leaderboardPosition !== null || isPersonalRecord) {
      // Determine which sound to play (based on priority)
      if (leaderboardPosition === -1) {
        playSound(sounds.noRecord); // Didn't reach leaderboard
      } else if (isPersonalRecord && leaderboardPosition !== null) {
        playSound(sounds.doubleScore); // Double victory!
      } else if (leaderboardPosition !== null) {
        playSound(sounds.leaderboard); // Leaderboard achievement
      } else if (isPersonalRecord) {
        playSound(sounds.personal); // Personal record but no leaderboard
      }
    }
  }, [leaderboardPosition, isPersonalRecord]); // Only trigger when these states change

  // Returns UI element which shows leaderboard-related information
  // Renders both leaderboard and personal record conditions
  const renderSpecialAchievements = () => {
    if (leaderboardPosition === -1) {
      return <Text style={styles.quizResultText}>😞 Sorry! 😞{"\n"}You didn't reach the leaderboard this time.</Text>;
    }

    if (leaderboardPosition !== null && isPersonalRecord) {
      return (
        <Text style={styles.quizResultText}>🏆 Double victory! 🏆{"\n"}You've set a new personal record and reached leaderboard position {leaderboardPosition}!{"\n"}Keep up the amazing work! 🎉</Text>
      );
    }

    if (leaderboardPosition !== null) {
      return <Text style={styles.quizResultText}>🎉 Congratulations! 🎉{"\n"}You've reached leaderboard position {leaderboardPosition}!</Text>;
    }

    if (isPersonalRecord) {
      return <Text style={styles.quizResultText}>🔥 It's a new personal record! 🔥{"\n"}Keep going!</Text>;
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainerFull}>
        <Text style={styles.title}>Game ended</Text>

        <Text style={styles.quizResultText}>You got {totalPoints} points! 🎯</Text>
        {/* Display the special achievements message */}
        {renderSpecialAchievements()}

        
        <View style={styles.startButtonContainer}>
          {/* A button for playing a new game */}
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/createQuiz')}  // Navigate to create quiz
          >
            <Text style={styles.buttonText}>Play again</Text>
          </TouchableOpacity>
        
          {/* Button for Leaderboard */}
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/leaderboard')}  // Navigate to Leaderboard screen
          >
            <Text style={styles.buttonText}>Leaderboard</Text>
          </TouchableOpacity>
        </View>
         
      </View>
    </View>
  );
}