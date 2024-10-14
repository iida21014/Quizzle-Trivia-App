import AsyncStorage from '@react-native-async-storage/async-storage';

export const isLoggedIn = async () => {
  const token = await AsyncStorage.getItem('token');
  console.log('Token found in AsyncStorage:', token); // Debug: Log token value
  return !!token; // If token exists, return true (logged in), otherwise false
};
