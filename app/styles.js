import { StyleSheet, Dimensions } from 'react-native';

// Getting screen dimensions in order to resize white background
// https://reactnative.dev/docs/dimensions
const screenDimensions = Dimensions.get('window');
const screenWidth = screenDimensions.width;
const screenHeight = screenDimensions.height;

const styles = StyleSheet.create({
  // Shared styles accross the application
  button: {
    backgroundColor: '#65558F',
    width: 200,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e7e2f2',
  },
  contentContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  contentContainerFull: {
    backgroundColor: '#fff', // White background for the content area
    padding: 20,
    borderRadius: 10,
    width: screenWidth - 90,
    height: screenHeight - 150,
  },
  startButtonContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  title2: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
    marginBottom: 20,
  },

  // Home view styles
  logo: {
    alignItems: 'center',
    width: 200,
    height: 150,
    marginBottom: 20,
  },

  // Quiz view styles
  animatedText: {
    fontWeight: 'bold',
  },
  answerResultContainer: {
    marginTop: 25,
    alignItems: 'center',
  },
  correctAnswersInARowText: {
    color: '#ff8c00',
    marginTop: 15,
    fontSize: 20,
    fontWeight: 'bold',
  },
  questionAlternative: {
    borderColor: 'black',
    borderWidth: 1,
    padding: 5,
    marginBottom: 10,
    backgroundColor: '#e7e2f2',
  },
  questionAlternativeText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
  },
  timeLeftBar: {
    height: 20,
  },
  timeLeftBarContainer: {
    width: '100%',
    marginBottom: 20,
  },
  titleQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },

  // User views
  deleteButtonContainer: {
    backgroundColor: 'red',
    width: 200,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  input: {
    width: '95%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateUsernamebutton: {
    backgroundColor: '#65558F',
    width: 200,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 20,
  },

  // Leaderboard
  leaderboardItem: {
    width: '100%',
    flexDirection: 'row', // Aligns items horizontally
    justifyContent: 'space-between', // Puts space between the username and points
    padding: 10,
    borderBottomWidth: 1, // Adds a bottom border to separate items
    borderBottomColor: '#ccc', // Light gray border color
  },
  leaderboardStyle: {
    flex: 1,
    // flexGrow: 0,    // Prevents FlatList from expanding vertically
  },
  noScores: {
    textAlign: 'center',
  },
  rank: {
    width: 30, // Fixed width for rank column
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    flex: 1, // Take up full available width
    alignItems: 'center', // Center items vertically
  },
  score: {
    width: 50, // Fixed width for the score column
    textAlign: 'right', // Align score to the right
    fontWeight: 'bold',
  },
  tabBar: {
    backgroundColor: '#f5f5f5', // Light gray background
    shadowOpacity: 0, // Remove shadow
  },
  tabBarActiveLabel: {
    color: '#65558F', // Color of the active tab label
  },
  tabBarInactiveLabel: {
    color: 'gray', // Color of the inactive tab label
  },
  tabBarIndicator: {
    backgroundColor: '#65558F', // Color of the underline indicator
    height: 3, // Indicator height
  },
  tabBarLabel: {
    fontSize: 14, // Label font size
    fontWeight: 'bold', // Bold labels
  },
  username: {
    flex: 1, // Take up remaining space for the username
    textAlign: 'left', // Left align the username
  },
  yourUsername: {
    fontWeight: 'bold', // Bold the current user's username
    color: '#65558F',
  },

  // Create Quiz view
  picker: {
    marginBottom: 5,
  },

  // Quiz result view
  quizResultText: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default styles;
