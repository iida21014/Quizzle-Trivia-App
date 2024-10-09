import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LoginScreenNavigationProp } from './navigationTypes';

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Log the username and password before sending the request
      console.log('Attempting to log in with:', { username, password });
  
      //vaihda tää sit ku app on gcloudissa const response = await fetch('https://quizzleapp.lm.r.appspot.com/login', {
        const response = await fetch('http://192.168.101.100:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      // Log the response status code and data for debugging purposes
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token); // Store the token securely
        Alert.alert(
          'Success',
          'Login successful',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('Navigating to UserScreen'); // Debug log
                navigation.navigate('UserScreen'); // Navigate to UserScreen after successful login
              },
            },
          ],
          { cancelable: false }
        );
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
        <Button
          title="Login"
          onPress={handleLogin}
          disabled={!username || !password || loading} // Disable login if fields are empty or loading
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    borderColor: '#ccc',
  },
});

export default LoginScreen;
