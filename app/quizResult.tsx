import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import styles from './styles';

export default function QuizResult() {
  // Reading game results which have been set by Quiz view when navigating here
  const { totalPoints, categoryId } = useLocalSearchParams();
  
  // State for showing leaderboard position and pesronal record
  const { leaderboardPosition, setLeaderboardPosition } = useState(null);
  const { isPersonalRecord, setIsPersonalRecord } = useState(false)
  
  // Sends user points to backend and sets leaderboard results to the UI
  async function postPlayerPoints(score, category) {
    // TODO: Backend implementation not ready
    // try {
    //   const response = await fetch('https://quizzleapp.lm.r.appspot.com/items', { method: 'POST', body: JSON.stringify({
    //     score,
    //     username: 'someUser',
    //     category,
    //   })});
    //   const { leaderboardPosition: position, isPersonalRecord: isRecord } = await response.json();

    //   setLeaderboardPosition(position);
    //   setIsPersonalRecord(isRecord);
    // } catch (error) {
    //   console.error('Could not save leaderboard points', error);
    // }
  }

  // Returns UI element which shows leaderboard-related information
  function renderLeaderboardPosition() {
    // Leaderboard position not fetched from the backend, returning nothing
    if (leaderboardPosition == null) {
      return null;
    }

    // Score didn't reacth the leaderboard
    if (leaderboardPosition === -1) {
      return <Text>Sorry, you couldn't reach the leaderboard</Text>
    }

    return <Text>Congratulations! You reached leaderboard position {leaderboardPosition}</Text>
  }

  // Returns a UI element for notifying about personal record
  function renderPersonalRecord() {
    if (!isPersonalRecord) {
      return null;
    }

    return <Text>It's a new personal record!</Text>
  }

  // When view initializes, sending game results to backend
  useEffect(() => {
    postPlayerPoints(totalPoints, categoryId);
  }, []);
  
  return (
    <View style={styles.container}>
      <View style={styles.contentContainerFull}>
        <Text style={styles.title}>Game ended</Text>
        
        <Text>You got {totalPoints} points!</Text>
        {renderLeaderboardPosition()}
        {renderPersonalRecord()}

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