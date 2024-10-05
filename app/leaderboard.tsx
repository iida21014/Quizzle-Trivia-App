import {useState, useEffect} from 'react';
import styles from './styles'; 
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(null);     // For error handling

  // Function to fetch leaderboard data from the API
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('https://quizzleapp.lm.r.appspot.com/leaderboard');
      const data = await response.json();
      setLeaderboard(data);
      setLoading(false); // Stop loading when data is fetched
    } catch (error) {
      setError(error);
      setLoading(false); // Stop loading on error
      Alert.alert('Error', 'Failed to fetch leaderboard data.');
    }
  };

  // useEffect to call the fetch function when the component mounts
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Key handler for FlatList
  const keyHandler = (item, index) => {
    return index.toString();
  };

  // Render leaderboard item
  const renderLeaderboard = ({ item, index }) => {
    return (
      <View style={styles.leaderboardItem}>
        <Text>{index + 1}. {item.username}</Text>
        <Text>{item.score} p</Text>
      </View>
    );
  };

  // Show loading spinner if data is being fetched
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Render the leaderboard
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <FlatList style={styles.leaderboardStyle}
          keyExtractor={keyHandler}
          data={leaderboard}
          renderItem={renderLeaderboard}
        />
      </View>
    </View>
  );
};
