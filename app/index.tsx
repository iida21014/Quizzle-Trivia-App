import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import styles from './styles';
import { isLoggedIn } from '../backend/authStatus'; // Ensure this function is properly implemented
import { Audio } from 'expo-av';


export default function HomeScreen() {
  const [loggedIn, setLoggedIn] = useState(false);  // State for login status
  const router = useRouter();  // Initialize router

  let music; // Local variable to store the sound instance

  // Function to play the music
  const playMusic = async () => {
    try {
      console.log('Loading Sound');
      const { sound: newMusic } = await Audio.Sound.createAsync(
        require('../assets/sounds/allAround.wav')
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

  // Function to check login status
  const checkLoginStatus = async () => {
    const loggedInStatus = await isLoggedIn();  // Check if the user is logged in
    setLoggedIn(loggedInStatus);  // Update the state
  };

  // useFocusEffect to check login status when the screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('Home screen focused, checking login status...');
      checkLoginStatus();  // Check login status when the home screen gains focus
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
          onPress={() => router.push('/LoginScreen')}  // Navigate to Login screen
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      )}

        {/* Button for Play Game */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/createQuiz')}  // Navigate to Quiz screen
        >
          <Text style={styles.buttonText}>Play Game</Text>
        </TouchableOpacity>

      {/* Button for Leaderboard */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/leaderboard')}  // Navigate to Leaderboard screen
        >
          <Text style={styles.buttonText}>Leaderboard</Text>
        </TouchableOpacity>

      {/* Render "User Info" button at the bottom when logged in */}
      {loggedIn && (
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/UserScreen')}  // Navigate to User Info screen
          >
            <Text style={styles.buttonText}>User Info</Text>
          </TouchableOpacity>
      )}
      </View>

    </View>
  );
}
