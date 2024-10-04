import { StyleSheet } from 'react-native';

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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
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
});

export default styles;
