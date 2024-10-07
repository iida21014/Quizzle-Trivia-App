import { Stack } from 'expo-router';
import { TokenProvider } from '../TokenContext';

export default function RootLayout() {
  return (
    <TokenProvider>
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#65558F',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen options={{ title: 'Home' }} name="index" />
      <Stack.Screen options={{ title: 'Create a Quiz'}} name="createQuiz" />
      <Stack.Screen options={{ title: 'Quiz' }} name="quiz" />
      <Stack.Screen options={{ title: 'Leaderboard' }} name="leaderboard" />
    </Stack>
    </TokenProvider>
  );
}
