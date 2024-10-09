import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing JWT securely
import { useNavigation } from '@react-navigation/native'; // For navigation after logout
import { UserScreenNavigationProp } from './navigationTypes'; // Import the navigation prop type

const UserScreen = () => {
  const [username, setUsername] = useState('');
  const navigation = useNavigation<UserScreenNavigationProp>(); // Use the imported type for navigation

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token'); // Retrieve token

        if (!token) {
          Alert.alert('Error', 'No token found');
          return;
        }

      //vaihda tää sit ku app on gcloudissa const response = await fetch('https://quizzleapp.lm.r.appspot.com/protected', {
        const response = await fetch('http://192.168.101.100:3000/protected', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Pass the token for authentication
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.user.username); // Set the username
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
    
              //vaihda tää sit ku app on gcloudissa const response = await fetch('https://quizzleapp.lm.r.appspot.com/delete-user', {
              const response = await fetch('http://192.168.101.100:3000/delete-user', {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`, // Send the token for authentication
                },
              });

              const data = await response.json();

              if (response.ok) {
                // Show success alert and log out the user
                Alert.alert('Success', 'Your account has been deleted.');

                // Remove the JWT token from AsyncStorage
                await AsyncStorage.removeItem('token');

                // Navigate back to the login screen after deletion
                navigation.navigate('LoginScreen'); // Navigate to the login screen
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
      navigation.navigate('LoginScreen'); // Navigate to the login screen
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {username}!</Text>
      <Button title="Logout" onPress={handleLogout} color="blue" />

      <View style={styles.deleteButtonContainer}>
        <Button title="Delete Account" color="red" onPress={deleteUser} />
      </View>
    </View>
  );
};

// Styling for the UserScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 20,
  },
  deleteButtonContainer: {
    marginTop: 20,
  },
});

export default UserScreen;
