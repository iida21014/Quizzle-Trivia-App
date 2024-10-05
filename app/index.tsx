import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import styles from './styles';

export default function HomeScreen() {
  const router = useRouter(); // Initialize router
  return (
    <View style={styles.container}>
      {/* Container for title and buttons */}
      <View style={styles.contentContainer}>

      <Image 
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

         {/* Button for Play Game */}
         <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/Quiz')}  // Navigate to Quiz screen
        >
          <Text style={styles.buttonText}>Play Game</Text>
        </TouchableOpacity>
        
        {/* Button for Leaderboard */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/leaderboard')}  // Navigate to Leaderboard screen
        >
          <Text style={styles.buttonText}>Leaderboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
