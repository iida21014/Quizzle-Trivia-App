import React, { createContext, useState, useEffect } from 'react';

// Define the context type interface for token management
interface TokenContextType {
  token: string | null;              // The current token, or null if not yet generated
  regenerateToken: () => Promise<void>; // Function to regenerate a new token
}

// Create the TokenContext with default value as null
export const TokenContext = createContext<TokenContextType | null>(null);

// Create a provider component to wrap the app or components that need token access
export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);  // State to store the token

  // Function to generate a new token by making an API request
  const generateToken = async () => {
    try {
      // Fetch a new session token from the API
      const response = await fetch('https://opentdb.com/api_token.php?command=request');
      const data = await response.json();
      // Set the token in state after a successful response
      setToken(data.token);
    } catch (error) {
      // Handle and log any errors during the token fetch process
      console.error('Error generating token:', error);
    }
  };

  // Function to explicitly regenerate the token (can be called from context)
  const regenerateToken = async () => {
    await generateToken();  // Reuse the generateToken function to fetch a new token
  };

  // useEffect hook to automatically generate the token on component mount
  useEffect(() => {
    generateToken();  // Fetch the token when the provider is mounted
  }, []);  // Empty dependency array ensures this runs only once on mount

  // useEffect hook to log the token whenever it changes (for debugging or informational purposes)
  useEffect(() => {
    console.log('Current token:', token);  // Log token value to the console when it updates
  }, [token]);  // Run this effect whenever `token` state changes
  
  return (
    // Provide the token and regeneration function to the context consumers
    <TokenContext.Provider value={{ token, regenerateToken }}>
      {children}  {/* Render the children components passed to the provider */}
    </TokenContext.Provider>
  );
};
