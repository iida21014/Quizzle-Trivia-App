import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserScreen = ({ navigation }: any) => {
  const [userInfo, setUserInfo] = useState<any>(null);

  const fetchUserInfo = async () => {
    try {
      // Fetch the JWT token stored in AsyncStorage or SecureStore
      const token = await AsyncStorage.getItem('token');

      const response = await fetch('http://localhost:3000/protected', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data.user); // Assuming the server sends back user info
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
    // Clear the token from AsyncStorage or SecureStore and navigate back to LoginScreen
    navigation.navigate('LoginScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Info</Text>
      {userInfo ? (
        <View>
          <Text>Username: {userInfo.username}</Text>
          {/* Add more user-specific info here */}
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
