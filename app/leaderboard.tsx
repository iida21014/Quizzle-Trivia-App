import { useState, useEffect, useCallback } from 'react';
import styles from './styles';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleScreenMusic} from './soundManager'; // Import sound-related functions from soundManager


const LeaderboardScreen = () => {  
  const [selectedCategoryId, setSelectedCategoryId] = useState(0); // State for category
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState([
    { key: 'allUsers', title: 'All' }, // Start with only the "All" tab
  ]);  // Use state for dynamic routes

  const sounds = {
    allAroundMusic: require('../assets/sounds/allAround.wav'), // Add your quiz music file here
  };

  handleScreenMusic(sounds.allAroundMusic); // This will handle music play/stop on screen focus


  const [leaderboardsView, setLeaderboardsView] = useState({
    allUsers: [],
    currentUser: [],
  });
  
  const [loadingView, setLoadingView] = useState({
    allUsers: true,
    currentUser: true,
  });

  const [username, setUsername] = useState('');

// Fetch the username from AsyncStorage when the component mounts
useEffect(() => {
  const getUsername = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username'); // Retrieve username from storage
      if (storedUsername) {
        setUsername(storedUsername); // Set the username if found

        // Add the "You" tab when a user is logged in
        setRoutes([
          { key: 'allUsers', title: 'All' },
          { key: 'currentUser', title: 'You' }
        ]);
      } else {
        Alert.alert('Login', 'Login to see your personal scores');
      }
    } catch (error) {
      console.error('Error fetching username from storage:', error);
      Alert.alert('Error', 'An error occurred while fetching the username');
    }
  };

  getUsername();
}, []); // Empty dependency array to ensure it runs once when the component mounts


  const categories = [
    { id: 0, name: 'All' },
    { id: 10, name: 'Books' },
    { id: 11, name: 'Films' },
    { id: 12, name: 'Music' },
    { id: 14, name: 'Television' },
    { id: 17, name: 'Science & Nature' },
    { id: 18, name: 'Computers' },
    { id: 19, name: 'Mathematics' },
    { id: 21, name: 'Sports' },
    { id: 22, name: 'Geography' },
    { id: 23, name: 'History' },
  ];

  // Function to fetch leaderboard data from the API with optional username filtering
  const fetchLeaderboard = async (categoryId = 0, user = '') => {
    try {
      let url = `https://quizzleapp.lm.r.appspot.com/leaderboard?category=${categoryId}`;

      if (user) {
        url += `&username=${encodeURIComponent(user)}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      return data;  // Return the data for individual view
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch leaderboard data.');
      return [];
    }
  };

  // Fetch data for both 'allUsers' and 'currentUser' tab when category changes
  useEffect(() => {
    const fetchData = async () => {
      // Fetch data for 'allUsers'
      setLoadingView(prev => ({ ...prev, allUsers: true }));
      const allUsersData = await fetchLeaderboard(selectedCategoryId);
      setLeaderboardsView(prev => ({ ...prev, allUsers: allUsersData }));
      setLoadingView(prev => ({ ...prev, allUsers: false }));

      // Fetch data for 'currentUser' if username is provided
      if (username) {
        setLoadingView(prev => ({ ...prev, currentUser: true }));
        const currentUserData = await fetchLeaderboard(selectedCategoryId, username);
        setLeaderboardsView(prev => ({ ...prev, currentUser: currentUserData }));
        setLoadingView(prev => ({ ...prev, currentUser: false }));
      }
    };

    fetchData();
  }, [selectedCategoryId, username]);

  // Key handler for FlatList
  const keyHandler = (item, index) => index.toString();

  const renderLeaderboard = ({ item, index }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.row}>
        <Text style={styles.rank}>
          {index + 1}.
        </Text>
  
        <Text style={[styles.username, item.username === username ? styles.yourUsername : null]}>
          {item.username}  {/* Username conditionally bold if it matches current user */}
        </Text>
  
        <Text style={styles.score}>
          {item.score} p 
        </Text>
      </View>
    </View>
  );

  // Render leaderboard view for 'allUsers'
  const renderLeaderboardView = () => (
    <View style={styles.container}>
      <View style={styles.contentContainerFull}>
      <Text style={styles.title}>🏆 TOP 10 scores 🏆</Text>
      <Text>From the category:</Text>
      <Picker
        selectedValue={selectedCategoryId}
        onValueChange={(itemValue) => setSelectedCategoryId(itemValue)}
      >
        {categories.map(({ id, name }) => (
          <Picker.Item key={id} label={name} value={id} />
        ))}
      </Picker>

      
      {loadingView.allUsers ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
            {leaderboardsView.allUsers.length === 0 ? (
              <Text style={styles.noScores}>No scores yet 😢</Text>  /* Show this message when there's no data */
      ) : (
        <FlatList
          style={styles.leaderboardStyle}
          keyExtractor={keyHandler}
          data={leaderboardsView.allUsers}
          renderItem={renderLeaderboard}
        />
        )}
        </>
      )}
    </View>
    </View>
  );

  // Render leaderboard view for 'currentUser'
  const renderUserLeaderboardView = () => (
    <View style={styles.container}>
      <View style={styles.contentContainerFull}>
      <Text style={styles.title}>🎉 Your TOP scores 🎉</Text>
      <Text>From the category:</Text>
      <Picker
        selectedValue={selectedCategoryId}
        onValueChange={(itemValue) => setSelectedCategoryId(itemValue)}
      >
        {categories.map(({ id, name }) => (
          <Picker.Item key={id} label={name} value={id} />
        ))}
      </Picker>
      
      {loadingView.currentUser ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
            {leaderboardsView.currentUser.length === 0 ? (
              <Text style={styles.noScores}>No scores yet 😢</Text>  /* Show this message when there's no data */
      ) : (
        <FlatList
          style={styles.leaderboardStyle}
          keyExtractor={keyHandler}
          data={leaderboardsView.currentUser}
          renderItem={renderLeaderboard}
        />
      )}
      </>
      )}
    </View>
    </View>
  );

  // Define scenes for each tab
  const renderScene = SceneMap({
    allUsers: renderLeaderboardView,
    currentUser: renderUserLeaderboardView,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: '100%' }}
      renderTabBar={props => <TabBar {...props}      
      style={styles.tabBar}  // Apply the TabBar background style
      labelStyle={styles.tabBarLabel}  // Apply the TabBar label style
      activeColor={styles.tabBarActiveLabel.color}  // Apply the active label color
      inactiveColor={styles.tabBarInactiveLabel.color}  // Apply the inactive label color
      indicatorStyle={styles.tabBarIndicator}  // Apply the indicator style 
      />}
    />
    
  );
}

export default LeaderboardScreen;