import React, { createContext, useState, useEffect } from 'react';

// Define the context type
interface TokenContextType {
  token: string | null;
  regenerateToken: () => Promise<void>;
}

// Create the context
export const TokenContext = createContext<TokenContextType | null>(null);

// Create a provider component
export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  // Function to generate the token
  const generateToken = async () => {
    try {
      const response = await fetch('https://opentdb.com/api_token.php?command=request');
      const data = await response.json();
      setToken(data.token);
    } catch (error) {
      console.error('Error generating token:', error);
    }
  };

  const regenerateToken = async () => {
    await generateToken();
  };

  useEffect(() => {
    generateToken(); // Generate token on component mount
  }, []);

  // Log the token whenever it changes
  useEffect(() => {
    console.log('Current token:', token);
  }, [token]);
  
  return (
    <TokenContext.Provider value={{ token, regenerateToken }}>
      {children}
    </TokenContext.Provider>
  );
};
