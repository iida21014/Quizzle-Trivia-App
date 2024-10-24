import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Remove TypeScript-specific type
import styles from './styles';  // Ensure it's pointing to the correct styles file
import { handleScreenMusic } from './soundManager';

const RegisterScreen = () => {
  const navigation = useNavigation(); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const sounds = {
    allAroundMusic: require('../assets/sounds/allAround.wav'),
  };

  handleScreenMusic(sounds.allAroundMusic);  // This will start music when screen is in focus and stop it when the screen is not in focus

  // Function to handle registering a user
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

      if (response.ok) {
        Alert.alert(
          'Success',
          'User registered successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('LoginScreen'); // Navigate to login screen after registration
              },
            },
          ],
          { cancelable: false } // Prevent dismissal by tapping outside
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
