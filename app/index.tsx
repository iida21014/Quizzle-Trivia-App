import { Link } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles'; 

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Container for title and buttons */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Quizzle</Text>
        
        {/* Button for Play Game */}
        <TouchableOpacity style={styles.button}>
          <Link href="/question" style={{ textAlign: 'center' }}>
            <Text style={styles.buttonText}>Play Game</Text>
          </Link>
        </TouchableOpacity>
        
        {/* Button for Leaderboard */}
        <TouchableOpacity style={styles.button}>
          <Link href="/leaderboard" style={{ textAlign: 'center' }}>
            <Text style={styles.buttonText}>Leaderboard</Text>
          </Link>
        </TouchableOpacity>
      </View>
    </View>
  );
}
