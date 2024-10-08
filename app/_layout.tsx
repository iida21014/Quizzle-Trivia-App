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
            headerRight: () => (
              <>
                <Button 
                  onPress={() => navigation.navigate('LoginScreen')} 
                  title="Login"
                  color="#000000"
                />
                <Button 
                  onPress={() => navigation.navigate('UserScreen')} 
                  title="User Info"
                  color="#000000"
                />
              </>
            ),
          })} 
          name="index" 
        />

        {/* Other Screens */}
        <Stack.Screen options={{ title: 'Create a Quiz' }} name="createQuiz" />
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
                <Button 
                  onPress={() => navigation.navigate('UserScreen')} 
                  title="User Info"
                  color="#000000"
                />
              </>
            ),
          })} 
          name="LoginScreen" 
        />
        
        {/* User Screen */}
        <Stack.Screen 
          options={({ navigation }) => ({
            headerTitle: 'User Info',
            headerRight: () => (
              <Button 
                onPress={() => navigation.navigate('LoginScreen')} 
                title="Login"
                color="#000000"
              />
            ),
          })} 
          name="UserScreen" 
        />

        {/* Register Screen */}
        <Stack.Screen 
          options={({ navigation }) => ({
            headerTitle: 'Register',
            headerRight: () => (
              <Button 
                onPress={() => navigation.navigate('LoginScreen')} 
                title="Login"
                color="#000000"
              />
            ),
          })} 
          name="RegisterScreen" 
        />
      </Stack>
    </TokenProvider>
  );
}
