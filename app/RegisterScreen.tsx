import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RegisterScreenNavigationProp } from './navigationTypes';
import styles from './styles';
import { handleScreenMusic} from './soundManager'; // Import sound-related functions from soundManager

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const sounds = {
    allAroundMusic: require('../assets/sounds/allAround.wav'), // Add your quiz music file here
  };

  handleScreenMusic(sounds.allAroundMusic); // This will handle music play/stop on screen focus

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
      // console.log('Response Status:', response.status);
      // console.log('Response Data:', data);
      // console.log('Response OK:', response.ok);
  
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
