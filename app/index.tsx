import { Link } from 'expo-router';
import { View, Text } from 'react-native';
import styles from './styles'; 

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Quizzle</Text>
      <Link href="/question">Play game</Link>
      <Link href="/leaderboard">Leaderboard</Link>
    </View>
  );
};
