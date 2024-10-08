import { StyleSheet, Dimensions } from 'react-native';

// Getting screen dimensions in order to resize white background
// https://reactnative.dev/docs/dimensions
const screenDimensions = Dimensions.get('window');
const screenWidth = screenDimensions.width;
const screenHeight = screenDimensions.height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e7e2f2', // Background color for the whole page
  },
  contentContainer: {
    backgroundColor: '#fff',   // White background for the content area
    padding: 20,
    borderRadius: 10,
  },
  contentContainerFull: {
    backgroundColor: '#fff',   // White background for the content area
    padding: 20,
    borderRadius: 10,
    width: screenWidth - 90,
    height: screenHeight - 150,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  title2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
    marginBottom: 20,
  },
  logo: {
    alignItems: 'center',
    width: 200,  
    height: 150,  
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#65558F', // Button color
    width: 200,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,        // Space between buttons
  },
  buttonText: {
    color: '#fff',             // White text color
    fontSize: 16,
  },
  leaderboardItem:{
    width: '100%',
    flexDirection: 'row',     // Aligns items horizontally
    justifyContent: 'space-between',  // Puts space between the username and points
    padding: 10,
    borderBottomWidth: 1,     // Adds a bottom border to separate items
    borderBottomColor: '#ccc',// Light gray border color
  },

  leaderboardStyle:{
    flex: 1,
    // flexGrow: 0,    // Prevents FlatList from expanding vertically
  },

/*
an attempt to get the category picker to be next to text
  leaderboardPicker:{
    flexDirection: "row",
    justifyContent: 'space-between', 
  },
 */
  picker: {
    marginBottom: 5,
  },
  startButtonContainer: {
    marginTop: 10,
    alignItems: 'center',
  }

});

export default styles;
