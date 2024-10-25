import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import { useRouter } from 'expo-router';
import { handleScreenMusic, playMusic, stopMusic } from './soundManager';
import { createSettingsTable, getSettings, saveSettings } from './database';

const UserScreen = () => {
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [modalVisible, setModalVisible] = useState(false); // Modal for account deletion
  const [updateModalVisible, setUpdateModalVisible] = useState(false); // Modal for username update success
  const [logoutModalVisible, setLogoutModalVisible] = useState(false); // Modal for logout confirmation
  const [errorModalVisible, setErrorModalVisible] = useState(false); // Modal for general errors
  const [errorMessage, setErrorMessage] = useState(''); // State for error messages
  const navigation = useNavigation();
  const router = useRouter();

  const sounds = {
    allAroundMusic: require('../assets/sounds/allAround.wav'),
  };

  handleScreenMusic(sounds.allAroundMusic); // This will start music when screen is in focus and stop it when the screen is not in focus

 // Fetch user data and settings when the component mounts
  useEffect(() => {
    const fetchUserDataAndSettings = async () => {
       // Fetch user data
      try {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
          setErrorMessage('No token found');
          setErrorModalVisible(true); // Show error modal
          return;
        }

        const response = await fetch('https://quizzleapp.lm.r.appspot.com/protected', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,  // Pass the token for authentication
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.user.username);
          await AsyncStorage.setItem('username', data.user.username); // Store username in AsyncStorage
        } else {
          setErrorMessage('Failed to fetch user data');
          setErrorModalVisible(true); // Show error modal
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setErrorMessage('An error occurred while fetching user data');
        setErrorModalVisible(true); // Show error modal
      }
      // Fetch settings
      await createSettingsTable();
      const settings = await getSettings();
      setIsMusicEnabled(settings.musicEnabled === 1);
      setIsSoundEnabled(settings.soundEnabled === 1);
    };

    fetchUserDataAndSettings();
  }, []);

  // Function to handle username update
  const updateUsername = async () => {
    if (!newUsername || newUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      setErrorModalVisible(true); // Show error modal
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve token

      if (!token) {
        setErrorMessage('No token found');
        setErrorModalVisible(true); // Show error modal
        return;
      }

      const response = await fetch('https://quizzleapp.lm.r.appspot.com/update-username', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`, // Send the token for authentication
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: newUsername }), // Send the new username in the body
      });

      const data = await response.json(); // Parse the response

      if (response.ok) {
        setUsername(newUsername); // Update the displayed username
        await AsyncStorage.setItem('username', newUsername); // Store new username in AsyncStorage
        setUpdateModalVisible(true); // Show success modal
      } else {
        setErrorMessage(data.error || 'Failed to update username');
        setErrorModalVisible(true); // Show error modal
      }
    } catch (error) {
      console.error('Error updating username:', error);
      setErrorMessage('An error occurred while updating the username');
      setErrorModalVisible(true); // Show error modal
    }
  };

   // Function to toggle music state and save to SQLite
  const toggleMusic = async () => {
    const newState = !isMusicEnabled;
    setIsMusicEnabled(newState);
    await saveSettings(newState, isSoundEnabled); // Save to SQLite

    if (newState) {
      playMusic(sounds.allAroundMusic);
    } else {
      stopMusic();
    }
  };

  // Function to toggle sound effects state and save to SQLite
  const toggleSound = async () => {
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);
    await saveSettings(isMusicEnabled, newState); // Save to SQLite
  };

  const confirmDeleteUser = () => {
    setModalVisible(true);
  };

  // Function to handle user deletion
  const deleteUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        setErrorMessage('No token found');
        setErrorModalVisible(true); // Show error modal
        return;
      }

      const response = await fetch('https://quizzleapp.lm.r.appspot.com/delete-user', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setErrorMessage('Your account has been deleted.');
        setErrorModalVisible(true); // Show success modal
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('username');
        navigation.replace('LoginScreen');
      } else {
        setErrorMessage(data.error || 'Failed to delete account');
        setErrorModalVisible(true); // Show error modal
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setErrorMessage('An error occurred while deleting your account');
      setErrorModalVisible(true); // Show error modal
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    setLogoutModalVisible(true); // Show logout modal
  };

  const confirmLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('username');

      setLogoutModalVisible(false); // Close modal after logout
      navigation.replace('LoginScreen'); // Navigate to loginscreen
    } catch (error) {
      console.error('Error logging out:', error);
      setErrorMessage('Failed to log out');
      setErrorModalVisible(true); // Show error modal
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {username}!</Text>
      
      {/* Input field for new username */}
      <TextInput
        style={styles.input}
        placeholder="Enter new username"
        value={newUsername}
        onChangeText={setNewUsername}
      />

      {/* Button for Updating username */}
      <TouchableOpacity style={styles.updateUsernamebutton} onPress={updateUsername}>
        <Text style={styles.buttonText}>Update Username</Text>
      </TouchableOpacity>

       {/* Button for Leaderboard */}
      <TouchableOpacity style={styles.button} onPress={() => router.push('/leaderboard')}>
        <Text style={styles.buttonText}>Leaderboard</Text>
      </TouchableOpacity>

      {/* Button for logging out */}
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {/* Button for deleting the account */}
      <TouchableOpacity style={styles.deleteButtonContainer} onPress={confirmDeleteUser}>
        <Text style={styles.buttonText}>Delete account</Text>
      </TouchableOpacity>

       {/* Music Toggle Switch */}
      <View style={styles.settingRow}>
        <Text>Music 🎵</Text>
        <Switch
          onValueChange={toggleMusic}
          value={isMusicEnabled}
          trackColor={{ false: '#767577', true: '#a899cf' }}
          thumbColor={isMusicEnabled ? '#65558F' : '#f4f3f4'}
        />
      </View>

      {/* Sound Effects Toggle Switch */}
      <View style={styles.settingRow}>
        <Text>Sounds 🔉</Text>
        <Switch
          onValueChange={toggleSound}
          value={isSoundEnabled}
          trackColor={{ false: '#767577', true: '#a899cf' }}
          thumbColor={isSoundEnabled ? '#65558F' : '#f4f3f4'}
        />
      </View>

      {/* Custom Modal for Account Deletion Confirmation */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete your account? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => { deleteUser(); setModalVisible(false); }} style={styles.modalButton}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Modal for Username Update Confirmation */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={updateModalVisible}
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Username Updated</Text>
            <Text style={styles.modalMessage}>
              Your username has been updated successfully!
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setUpdateModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Modal for Logout Confirmation */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={confirmLogout} style={styles.modalButton}>
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setLogoutModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Modal for Error Messages */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={errorModalVisible}
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Error</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setErrorModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UserScreen;
