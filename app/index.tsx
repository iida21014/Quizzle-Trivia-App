import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import styles from './styles';
import { isLoggedIn } from '../backend/authStatus'; // Ensure this function is properly implemented

export default function HomeScreen() {
  const [loggedIn, setLoggedIn] = useState(false);  // State for login status
  const router = useRouter();  // Initialize router

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

        {/* Conditionally render "Login" or "User Info" button based on login status */}
        {!loggedIn ? (
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/LoginScreen')}  // Navigate to Login screen
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/UserScreen')}  // Navigate to User Info screen
          >
            <Text style={styles.buttonText}>User Info</Text>
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
      </View>
    </View>
  );
}
