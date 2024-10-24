import AsyncStorage from '@react-native-async-storage/async-storage';

// Function for checking if user is logged in (this for index page to show login button if user is not logged in and settings if user is logged in)
export const isLoggedIn = async () => {
  const token = await AsyncStorage.getItem('token');
  // Debug: Log token value console.log('Token found in AsyncStorage:', token);
  return !!token; // If token exists, return true (logged in), otherwise false
};
