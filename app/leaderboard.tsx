import {useState, useEffect} from 'react';
import styles from './styles'; 
import { View, Text, FlatList} from 'react-native';

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard]=useState([{"username":"Tiina", "points":200}, {"username":"Elias", "points":100}, {"username":"Pentti", "points":10}, {"username":"Iida", "points":5}, {"username":"Naapurin koira", "points":2}])

  const keyHandler=(item, index)=>{
    return index.toString();
  }

  const renderLeaderboard=({item, index})=>{
    return (
        <View style={styles.leaderboardItem}>
        <Text>{index + 1}. {item.username}</Text>
        <Text>{item.points} p</Text>
        </View>
    );
  }

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
