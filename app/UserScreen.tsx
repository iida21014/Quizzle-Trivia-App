import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { UserScreenNavigationProp } from './navigationTypes';

// Define the type for user info
type UserInfo = {
  username: string;
};

const UserScreen = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // State for user info
  const [loading, setLoading] = useState(true); // State for loading
  const navigation = useNavigation<UserScreenNavigationProp>();

  // Function to fetch user info
  const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      // vaihda tää sit ku app on gcloudissa const response = await fetch(''https://quizzleapp.lm.r.appspot.com/protected', {
      const response = await fetch('http://localhost:3000/protected', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User info:', data); // Log user info for debugging
        setUserInfo(data.user); // Update state with user info
      } else {
        const errorText = await response.text();
        console.error('Error fetching user info:', errorText); // Log error response
        Alert.alert('Error fetching user info', errorText);
      }
    } catch (error) {
      console.error('Error in fetchUserInfo:', error);
      Alert.alert('Error', 'Failed to fetch user info.');
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    fetchUserInfo(); // Fetch user info when the component mounts
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token'); // Clear the token on logout
    setUserInfo(null); // Reset userInfo state to null
    navigation.navigate('LoginScreen'); // Navigate back to login screen
  };

  // Show loading indicator while fetching user info
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading user info...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Info</Text>
      {userInfo ? (
        <View>
          <Text>Username: {userInfo.username}</Text> {/* Display username */}
        </View>
      ) : (
        <View>
          <Text>No user info available.</Text>
        </View>
      )}
      <Button title="Logout" onPress={handleLogout} /> {/* Logout button */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserScreen;
