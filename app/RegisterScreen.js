import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles'; 
import { handleScreenMusic } from './soundManager';

const RegisterScreen = () => {
  const navigation = useNavigation(); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [message, setMessage] = useState(''); // State for modal message
  const [success, setSuccess] = useState(false); // State for success or failure

  const sounds = {
    allAroundMusic: require('../assets/sounds/allAround.wav'),  // This will start music when screen is in focus and stop it when the screen is not in focus
  };

  handleScreenMusic(sounds.allAroundMusic); 

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
        // Set message and show success modal
        setMessage('User registered successfully');
        setSuccess(true);
        setModalVisible(true);
      } else {
        // Set message and show error modal
        setMessage(data.error || 'Failed to register');
        setSuccess(false);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error during registration', error);
      setMessage('Something went wrong.');
      setSuccess(false);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false); // Close modal
    if (success) {
      navigation.navigate('LoginScreen'); // Navigate to login screen if successful
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
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Registering...' : 'Register'}
        </Text>
      </TouchableOpacity>

      {/* Registration Confirmation Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{success ? 'Success' : 'Error'}</Text>
            <Text style={styles.modalMessage}>{message}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleModalClose} style={styles.modalButton}>
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default RegisterScreen;
