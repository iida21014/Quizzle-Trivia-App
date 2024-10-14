import { Stack } from 'expo-router';
import { TokenProvider } from '../TokenContext';
import { Button } from 'react-native';
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
        }}
      >
        {/* Home Screen */}
        <Stack.Screen 
          options={({ navigation }) => ({
            title: 'Home',
          })} 
          name="index" 
        />

        {/* Other Screens */}
        <Stack.Screen options={{ title: 'Create a Quiz' }} name="createQuiz" />
        <Stack.Screen options={{ title: 'Quiz result' }} name="quizResult" />
        <Stack.Screen options={{ title: 'Quiz' }} name="quiz" />
        <Stack.Screen options={{ title: 'Leaderboard' }} name="leaderboard" />
        {/* Login Screen */}
      <Stack.Screen 
        options={({ navigation }) => ({
          title: 'Login',
          headerRight: () => (
            <>
                <Button 
                  onPress={() => navigation.navigate('RegisterScreen')} 
                  title="Register"
                  color="#000000"
                />
            </>
          ),
        })} 
        name="LoginScreen" 
      />
        <Stack.Screen options={{ title: 'Register' }} name="RegisterScreen" />
        <Stack.Screen options={{ title: 'User Info' }} name="UserScreen" />
      </Stack>
    </TokenProvider>
  );
}
