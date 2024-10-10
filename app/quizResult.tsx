import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import styles from './styles';

export default function QuizResult() {
  // Reading game results which have been set by Quiz view when navigating here
  const { totalPoints, categoryId } = useLocalSearchParams();
  
  // State for showing leaderboard position and pesronal record
  // const { leaderboardPosition, setLeaderboardPosition } = useState(null);
  // const { isPersonalRecord, setIsPersonalRecord } = useState(false)
  
  // Sends user points to backend and sets leaderboard results to the UI
  async function postPlayerPoints(score, category) {
    try {
      const response = await fetch('https://quizzleapp.lm.r.appspot.com/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Telling backend it's receiving json
        },
        body: JSON.stringify({
          username: 'someUser',
          score,
          category,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`); // Helps catching network errors or incorrect http status codes
      }
  
      const data = await response.json();
      // Process the response here if needed, e.g. setting leaderboard data
      console.log('Response data:', data);
      // setLeaderboardPosition(data.leaderboardPosition);
      // setIsPersonalRecord(data.isPersonalRecord);
    } catch (error) {
      console.error('Could not save leaderboard points', error);
    }
  }

  // // Returns UI element which shows leaderboard-related information
  // function renderLeaderboardPosition() {
  //   // Leaderboard position not fetched from the backend, returning nothing
  //   if (leaderboardPosition == null) {
  //     return null;
  //   }

  //   // Score didn't reacth the leaderboard
  //   if (leaderboardPosition === -1) {
  //     return <Text>Sorry, you couldn't reach the leaderboard</Text>
  //   }

  //   return <Text>Congratulations! You reached leaderboard position {leaderboardPosition}</Text>
  // }

  // // Returns a UI element for notifying about personal record
  // function renderPersonalRecord() {
  //   if (!isPersonalRecord) {
  //     return null;
  //   }

  //   return <Text>It's a new personal record!</Text>
  // }

  // When view initializes, sending game results to backend
  useEffect(() => {
    console.log('totalPoints:', totalPoints, 'categoryId:', categoryId); // This is for debugging
    if (totalPoints && categoryId) {
      postPlayerPoints(totalPoints, categoryId);
    }
  }, [totalPoints, categoryId]);
  
  return (
    <View style={styles.container}>
      <View style={styles.contentContainerFull}>
        <Text style={styles.title}>Game ended</Text>
        
        <Text>You got {totalPoints} points!</Text>
        {/* {renderLeaderboardPosition()}
        {renderPersonalRecord()} */}

        {/* A button for playing a new game */}
        <View style={styles.startButtonContainer}>
          <View style={styles.button}>
            <Link
              style={styles.buttonText}
              href={{
                pathname: '/createQuiz',
              }}>
                    Play again
            </Link>
          </View>
        </View>
      </View>        
    </View>
  );
}