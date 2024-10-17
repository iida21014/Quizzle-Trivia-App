import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Alert, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing JWT securely
import { useNavigation } from '@react-navigation/native'; // For navigation after logout
import { UserScreenNavigationProp } from './navigationTypes'; // Import the navigation prop type
import styles from './styles';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

const UserScreen = () => {
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState(''); // State to store the new username
  const navigation = useNavigation<UserScreenNavigationProp>(); // Use the imported type for navigation
  const router = useRouter();  // Initialize router

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

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token'); // Retrieve token

        if (!token) {
          Alert.alert('Error', 'No token found');
          return;
        }

        const response = await fetch('https://quizzleapp.lm.r.appspot.com/protected', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Pass the token for authentication
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.user.username); // Set the username
          await AsyncStorage.setItem('username', data.user.username); // Store username in AsyncStorage
        } else {
          Alert.alert('Error', 'Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'An error occurred while fetching user data');
      }
    };

    fetchUserData();
  }, []);

  // Function to handle username update
  const updateUsername = async () => {
    if (!newUsername || newUsername.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve token

      if (!token) {
        Alert.alert('Error', 'No token found');
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
        Alert.alert('Success', 'Username updated successfully!');
      } else {
        Alert.alert('Error', data.error || 'Failed to update username');
      }
    } catch (error) {
      console.error('Error updating username:', error);
      Alert.alert('Error', 'An error occurred while updating the username');
    }
  };

  // Function to handle user deletion
  const deleteUser = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');

              if (!token) {
                Alert.alert('Error', 'No token found');
                return;
              }
    
              const response = await fetch('https://quizzleapp.lm.r.appspot.com/delete-user', {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`, // Send the token for authentication
                },
              });

              const data = await response.json();

              if (response.ok) {
                // Show success alert and log out the user
                Alert.alert('Success', 'Your account has been deleted.');

                // Remove the JWT token and username from AsyncStorage
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('username');

                // Navigate back to the login screen after deletion
                navigation.replace('LoginScreen'); // Navigate to the login screen
              } else {
                Alert.alert('Error', data.error || 'Failed to delete account');
              }
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'An error occurred while deleting your account');
            }
          },
        },
      ]
    );
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token'); // Remove the JWT token
      await AsyncStorage.removeItem('username'); // Remove the username from storage
      navigation.replace('LoginScreen'); // Navigate to the login screen
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out');
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
        onChangeText={setNewUsername} // Update newUsername state
      />

      {/* Button for Updating username */}
      <TouchableOpacity style={styles.button} onPress={updateUsername}>
        <Text style={styles.buttonText}>Update Username</Text>
      </TouchableOpacity>

      {/* Button for logging out */}
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {/* Button for Leaderboard */}
       <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/leaderboard')}  // Navigate to Leaderboard screen
          >
          <Text style={styles.buttonText}>Leaderboard</Text>
        </TouchableOpacity>

      {/* Button for deleting the account */}
      <TouchableOpacity style={styles.deleteButtonContainer} onPress={deleteUser}>
        <Text style={styles.buttonText}>Delete account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserScreen;
