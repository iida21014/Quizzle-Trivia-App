import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import styles from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { playSound } from './soundManager';

export default function QuizResult() {
  const { totalPoints, categoryId } = useLocalSearchParams(); // Reading game results which have been set by Quiz view when navigating here 
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [leaderboardPosition, setLeaderboardPosition] = useState(null);
  const [isPersonalRecord, setIsPersonalRecord] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false); // State for login modal
  const [errorModalVisible, setErrorModalVisible] = useState(false); // State for error modal
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const router = useRouter();

  const sounds = {
    doubleScore: require('../assets/sounds/doubleScore.wav'),
    personal: require('../assets/sounds/personalRecord.mp3'),
    leaderboard: require('../assets/sounds/leaderboardScore.wav'),
    noRecord: require('../assets/sounds/noRecord.wav'),
  };

  // Fetch the username from AsyncStorage when the component mounts
  useEffect(() => {
    const getUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username'); // Retrieve username from storage
        if (storedUsername) {
          setUsername(storedUsername);
          setIsLoggedIn(true);
        } else {
          setLoginModalVisible(true); // Show modal if not logged in
        }
      } catch (error) {
        console.error('Error fetching username from storage:', error);
        setErrorMessage('An error occurred while fetching the username');
        setErrorModalVisible(true); // Show error modal on exception
      }
    };

    getUsername();
  }, []);

  // Sends user points to backend and sets leaderboard results to the UI
  async function postPlayerPoints(username, score, category) {
    try {
      const response = await fetch(
        'https://quizzleapp.lm.r.appspot.com/leaderboard',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            score: parseInt(score, 10),
            category: parseInt(category, 10),
          }),
        }
      );

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
      setErrorMessage('Could not save your score. Please try again.');
      setErrorModalVisible(true); // Show error modal on exception
    }
  }

  // When view initializes, sending game results to backend
  useEffect(() => {
    if (username && totalPoints && categoryId) {
      console.log(
        'username:',
        username,
        'totalPoints:',
        totalPoints,
        'categoryId:',
        categoryId
      );
      postPlayerPoints(username, totalPoints, categoryId); // Only run when username is fetched and totalPoints/categoryId are valid
    }
  }, [username, totalPoints, categoryId]);

  // Play sounds based on leaderboard position and personal record
  useEffect(() => {
    if (leaderboardPosition !== null) {
      if (isPersonalRecord && leaderboardPosition === -1) {
        playSound(sounds.personal);
      } else if (leaderboardPosition === -1 && !isPersonalRecord) {
        playSound(sounds.noRecord);
      } else if (leaderboardPosition !== null && !isPersonalRecord) {
        playSound(sounds.leaderboard);
      } else if (leaderboardPosition !== null && isPersonalRecord) {
        playSound(sounds.doubleScore);
      }
    }
  }, [leaderboardPosition, isPersonalRecord]); // Only trigger when these states change

  // Returns UI element which shows leaderboard-related information
  // Renders both leaderboard and personal record conditions
  const renderSpecialAchievements = () => {
    if (isPersonalRecord && leaderboardPosition === -1) {
      return (
        <Text style={styles.quizResultText}>
          🔥 It's a new personal record! 🔥{'\n'}Keep going!
        </Text>
      );
    }
    if (leaderboardPosition === -1) {
      return (
        <Text style={styles.quizResultText}>
          😞 Sorry! 😞{'\n'}You didn't reach the leaderboard this time.
        </Text>
      );
    }

    if (leaderboardPosition !== null && isPersonalRecord) {
      return (
        <Text style={styles.quizResultText}>
          🏆 Double victory! 🏆{'\n'}You've set a new personal record and
          reached leaderboard position {leaderboardPosition}!{'\n'}Keep up the
          amazing work! 🎉
        </Text>
      );
    }

    if (leaderboardPosition !== null) {
      return (
        <Text style={styles.quizResultText}>
          🎉 Congratulations! 🎉{'\n'}You've reached leaderboard position{' '}
          {leaderboardPosition}!
        </Text>
      );
    }

    return null;
  };

  // Function to close the login modal
  const handleLoginModalClose = () => {
    setLoginModalVisible(false); // Close login modal
  };

  // Function to close the error modal
  const handleErrorModalClose = () => {
    setErrorModalVisible(false); // Close error modal
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainerFull}>
        <Text style={styles.title}>Game ended</Text>

        <Text style={styles.quizResultText}>
          You got {totalPoints} points! 🎯
        </Text>
        {/* Display the special achievements message */}
        {renderSpecialAchievements()}

        <View style={styles.startButtonContainer}>
          {/* Conditionally render login button if not logged in */}
          {!isLoggedIn && (
            <View>
              <Text style={styles.quizResultText}>
                Login to save your next score!
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/LoginScreen')}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* A button for playing a new game */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Play again</Text>
          </TouchableOpacity>
          
          {/* Button for Leaderboard */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/leaderboard')}
          >
            <Text style={styles.buttonText}>Leaderboard</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Login Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={loginModalVisible}
        onRequestClose={handleLoginModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Not Logged In</Text>
            <Text style={styles.modalMessage}>
              You need to log in to save your score.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleLoginModalClose} style={styles.modalButton}>
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={errorModalVisible}
        onRequestClose={handleErrorModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Error</Text>
            <Text style={styles.modalMessage}>
              {errorMessage}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleErrorModalClose} style={styles.modalButton}>
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
