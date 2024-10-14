import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LoginScreenNavigationProp } from './navigationTypes';
import styles from './styles';

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
    </View>
  );
};

export default LoginScreen;
