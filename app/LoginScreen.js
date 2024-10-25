import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import { handleScreenMusic } from './soundManager'; 

const LoginScreen = () => {
  const navigation = useNavigation(); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false); // State for login confirmation modal
  const [errorModalVisible, setErrorModalVisible] = useState(false); // State for error modal
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const [loginSuccess, setLoginSuccess] = useState(false); // State to track successful login

  const sounds = {
    allAroundMusic: require('../assets/sounds/allAround.wav'),
  };

  handleScreenMusic(sounds.allAroundMusic); 

  // Function to handle login
  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://quizzleapp.lm.r.appspot.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token); 
        await AsyncStorage.setItem('username', username); 
        setLoginSuccess(true); // Set login success state
        setConfirmModalVisible(true); // Show confirmation modal
      } else {
        setErrorMessage(data.error || 'Invalid credentials');
        setErrorModalVisible(true); // Show error modal
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Something went wrong. Please try again.');
      setErrorModalVisible(true); // Show error modal
    } finally {
      setLoading(false);
    }
  };

  const confirmLogin = () => {
    // Trigger login process
    handleLogin();
  };

  const handleConfirmLogin = () => {
    setConfirmModalVisible(false); // Close confirmation modal
    navigation.reset({
      index: 0,
      routes: [{ name: 'index' }], // Proceed with navigation on confirmation
    });
  };

  const handleErrorModalClose = () => {
    setErrorModalVisible(false); // Close error modal
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCorrect={false} 
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none" 
      />
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity
          style={[
            styles.button,
            (!username || !password || loading) && styles.disabledButton,
          ]}
          onPress={confirmLogin} // Trigger login process on press
          disabled={!username || !password || loading} 
        >
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
      )}
      <Text>Don't have an account?</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('RegisterScreen')} 
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      {/* Login Confirmation Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Login</Text>
            <Text style={styles.modalMessage}>
              Login successful
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleConfirmLogin} style={styles.modalButton}>
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
};

export default LoginScreen;
