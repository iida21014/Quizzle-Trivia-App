import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { UserScreenNavigationProp } from './navigationTypes';

// Define the type for user info
type UserInfo = {
  username: string;
  // Add other properties of user info if available, e.g., email, id, etc.
};

const UserScreen = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);  // Set the state type to UserInfo or null
  const navigation = useNavigation<UserScreenNavigationProp>();

  const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const response = await fetch('https://quizzleapp.lm.r.appspot.com/protected', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data.user); // Assuming data.user contains { username: string }
      } else {
        Alert.alert('Error', 'Failed to fetch user info');
      }
    } catch (error) {
      console.error('Error fetching user info', error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    AsyncStorage.removeItem('token');  // Clear the token on logout
    navigation.navigate('LoginScreen');  // Navigate back to login screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Info</Text>
      {userInfo ? (
        <View>
          <Text>Username: {userInfo.username}</Text> {/* No more TypeScript error here */}
        </View>
      ) : (
        <Text>Loading user info...</Text>
      )}
      <Button title="Logout" onPress={handleLogout} />
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
});

export default UserScreen;
