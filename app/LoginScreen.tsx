import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LoginScreenNavigationProp } from './navigationTypes';
import styles from './styles';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleLogin = async () => {
    setLoading(true);
    try {
      console.log('Attempting to log in with:', { username, password });
  
      const response = await fetch('https://quizzleapp.lm.r.appspot.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
  
      if (response.ok) {
        await AsyncStorage.setItem('token', data.token); // Store the token securely
        await AsyncStorage.setItem('username', username); // Store username in AsyncStorage
        Alert.alert('Success', 'Login successful', [
          {
            text: 'OK',
            onPress: () => {
              console.log('Navigating to start screen');
              // Use navigation.replace to reset the stack and go to home screen
              navigation.reset({
                index: 0, // Ensure the home screen is the only one in the stack
                routes: [{ name: 'index' }], // Name of your home screen
              });
            },
          },
        ]);
      } else {
        Alert.alert('Login failed', data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCorrect={false} // Disable autocorrect for username input
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none" // Prevent auto-capitalizing password
      />
      
      {/* Show loading indicator if login is in progress */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity
          style={[
            styles.button,
            (!username || !password || loading) && styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={!username || !password || loading} // Disable button if fields are empty or loading
        >
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
      )}
      <Text>Don't have an account?</Text>
      <TouchableOpacity
        style={styles.button} // Add styles for this button
        onPress={() => navigation.replace('RegisterScreen')} // Navigate to the Register Screen
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
