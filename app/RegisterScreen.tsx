import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RegisterScreenNavigationProp } from './navigationTypes';
import styles from './styles';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
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

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://quizzleapp.lm.r.appspot.com/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
      console.log('Response Status:', response.status);
      console.log('Response Data:', data);
      console.log('Response OK:', response.ok); // Check the response status
  
      if (response.ok) {
        Alert.alert(
          'Success',
          'User registered successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('LoginScreen');
              },
            },
          ],
          { cancelable: false } //Prevent dismissal by tapping outside
        );
      } else {
        Alert.alert('Registration failed', data.error || 'Failed to register');
      }
    } catch (error) {
      console.error('Error during registration', error);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]} // Apply different styles if loading
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Registering...' : 'Register'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};


export default RegisterScreen;
