import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import styles from './styles';
import { isLoggedIn } from './authStatus';
import { handleScreenMusic } from './soundManager'; // Import sound-related functions from soundManager
import { createSettingsTable } from './database'; // Ensure table is created early

export default function HomeScreen() {
  const [loggedIn, setLoggedIn] = useState(false); // State for login status
  const router = useRouter(); // Initialize router

  useEffect(() => {
    createSettingsTable(); // Create the settings table as soon as the app starts
  }, []);

  const sounds = {
    indexMusic: require('../assets/sounds/indexMusic.wav'), // Add your quiz music file here
  };

  handleScreenMusic(sounds.indexMusic); // This will handle music play/stop on screen focus

  // Function to check login status
  const checkLoginStatus = async () => {
    const loggedInStatus = await isLoggedIn(); // Check if the user is logged in
    setLoggedIn(loggedInStatus); // Update the state
  };

  // useFocusEffect to check login status when the screen is focused
  useFocusEffect(
    useCallback(() => {
      // console.log('Home screen focused, checking login status...');
      checkLoginStatus(); // Check login status when the home screen gains focus
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Container for title and buttons */}
      <View style={styles.contentContainer}>
        {/* App logo */}
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* Render "Login" button when not logged in */}
        {!loggedIn && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/LoginScreen')} // Navigate to Login screen
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        )}

        {/* Button for Play Game */}
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: '/createQuiz',
              params: {
                clearOptions: true, // This flag tells createQuiz to set quiz options to default.
              },
            })
          } // Navigate to Quiz screen
        >
          <Text style={styles.buttonText}>Play Game</Text>
        </TouchableOpacity>

        {/* Button for Leaderboard */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/leaderboard')} // Navigate to Leaderboard screen
        >
          <Text style={styles.buttonText}>Leaderboard</Text>
        </TouchableOpacity>

        {/* Render "User Info" button at the bottom when logged in */}
        {loggedIn && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/UserScreen')} // Navigate to User Info screen
          >
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
