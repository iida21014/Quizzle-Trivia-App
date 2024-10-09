// navigationTypes.ts
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  index: undefined; // Home screen
  LoginScreen: undefined; // Login screen
  RegisterScreen: undefined; // Register screen
  UserScreen: undefined; // User screen
  createQuiz: undefined; // Create quiz screen
  quiz: undefined; // Quiz screen
  leaderboard: undefined; // Leaderboard screen
};

// Navigation Prop
export type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoginScreen'>;
export type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegisterScreen'>;
export type UserScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'UserScreen'>;

// Route Prop (if needed)
export type LoginScreenRouteProp = RouteProp<RootStackParamList, 'LoginScreen'>;
