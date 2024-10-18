const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();  // Load environment variables from the .env file

const app = express();
app.use(cors());  // Enable Cross-Origin Resource Sharing for the app
app.use(express.json());  // Middleware to parse JSON request bodies

const uri = process.env.MONGODB_URI; // MongoDB connection URI from environment variables
const client = new MongoClient(uri);

let db, itemsCollection, usersCollection;  // Variables to hold references to collections

// Connect to the MongoDB database and initialize collections
client.connect()
  .then(() => {
    db = client.db("Quizzle");  // Connect to the "Quizzle" database
    itemsCollection = db.collection("Leaderboard");  // Initialize the Leaderboard collection
    usersCollection = db.collection("Users");  // Initialize the Users collection
    console.log('Connected to MongoDB');

    // Start the Express server on a specified port
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);  // Log connection errors
    process.exit(1);  // Exit the application if the connection fails
  });

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';  // JWT secret for signing tokens

// Middleware to verify JWT tokens for protected routes
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];  // Extract token from the Authorization header

  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ error: 'No token provided' });  // Return 401 if token is missing
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.status(403).json({ error: 'Invalid token' });  // Return 403 if token is invalid
    }

    req.user = decoded;  // Attach decoded user information to the request object
    next();  // Proceed to the next middleware or route handler
  });
};

// POST /register - Register a new user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;  // Extract username and password from the request body

  try {
    // Check if a user with the same username already exists
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      console.error('User already exists');
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password and create a new user document
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword };
    await usersCollection.insertOne(newUser);  // Insert the new user into the collection

    res.status(201).json({ message: 'User registered successfully' });  // Respond with success message
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /login - Authenticate user and return a JWT token
app.post('/login', async (req, res) => {
  const { username, password } = req.body;  // Extract username and password from the request body

  try {
    // Find the user by username
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });  // Return error if user not found
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });  // Return error if password mismatch
    }

    // Sign a JWT token with user info, valid for 12 hours
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });  // Return the JWT token in the response
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /protected - Protected route to fetch user info (requires valid token)
app.get('/protected', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;  // Extract userId from the decoded token

    // Find the user by ID
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });  // Return error if user not found
    }

    res.json({ user: { username: user.username } });  // Return the username
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /update-username - Update a user's username in both Users and Leaderboard collections (protected route)
app.put('/update-username', authenticateToken, async (req, res) => {
  const { username } = req.body;  // Extract new username from the request body

  // Validate the new username length
  if (!username || username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
  }

  try {
    const userId = req.user.userId;  // Get the user ID from the decoded token

    // Check if the new username already exists in the Users collection
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    // Start a session to handle multiple database operations as a transaction
    const session = client.startSession();
    session.startTransaction();

    try {
      // Update the username in the Users collection
      const updateUserResult = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },  // Find the user by ID
        { $set: { username } },  // Set the new username
        { session }  // Use the session for this operation
      );

      if (updateUserResult.modifiedCount === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: 'User not found or username was not updated.' });
      }

      // Update the username in the Leaderboard collection for all entries related to the user
      const updateLeaderboardResult = await itemsCollection.updateMany(
        { username: req.user.username },  // Find leaderboard entries with the old username
        { $set: { username } },  // Set the new username
        { session }  // Use the session for this operation
      );

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.json({
        message: 'Username updated successfully in both Users and Leaderboard collections',
        user: { username },
        leaderboardUpdated: updateLeaderboardResult.modifiedCount
      });
    } catch (error) {
      // If any operation fails, abort the transaction
      await session.abortTransaction();
      session.endSession();
      console.error('Transaction failed:', error);
      res.status(500).send('Error updating username in Users and Leaderboard collections');
    }
  } catch (error) {
    console.error('Error updating username:', error);
    res.status(500).send('Error updating username');
  }
});


// DELETE /delete-user - Delete a user account and their leaderboard entries (protected route)
app.delete('/delete-user', authenticateToken, async (req, res) => {
  const session = client.startSession(); // Start a session for the transaction

  try {
    const userId = req.user.userId;  // Extract userId from the decoded token
    const username = req.user.username; // Extract username from the decoded token

    session.startTransaction(); // Begin the transaction

    // Delete the user from the Users collection by ID
    const deleteUserResult = await usersCollection.deleteOne({ _id: new ObjectId(userId) }, { session });

    if (deleteUserResult.deletedCount === 0) {
      // If user was not found, abort the transaction
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the user's entries from the Leaderboard collection based on username
    const deleteLeaderboardResult = await itemsCollection.deleteMany({ username: username }, { session });

    // Commit the transaction if both operations are successful
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: 'User account and leaderboard entries deleted successfully',
      leaderboardDeleted: deleteLeaderboardResult.deletedCount // Number of leaderboard entries deleted
    });
  } catch (error) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();
    console.error('Error deleting user and leaderboard entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// GET /items - Fetch all items from the Leaderboard collection
app.get('/items', async (req, res) => {
  try {
    const items = await itemsCollection.find().toArray();  // Retrieve all items
    res.json(items);  // Respond with the items array
  } catch (err) {
    res.status(500).send('Error fetching items');
  }
});

// GET /leaderboard - Fetch top 10 leaderboard with optional filters for category and username
app.get('/leaderboard', async (req, res) => {
  try {
    const { category, username } = req.query;  // Extract query params
    const query = {};

    if (category) {
      query.category = parseInt(category);  // Filter by category if provided
    }

    if (username) {
      query.username = username;  // Filter by username if provided
    }

    // Fetch the top 10 items sorted by score in descending order
    const leaderboard = await itemsCollection
      .find(query)
      .sort({ score: -1 })
      .limit(10)
      .toArray();

    res.json(leaderboard);  // Return the leaderboard data
  } catch (err) {
    res.status(500).send('Error fetching leaderboard');
  }
});

// POST /items - Insert a new item into the Leaderboard collection
app.post('/items', async (req, res) => {
  try {
    const newItem = req.body;  // Extract the new item from the request body
    await itemsCollection.insertOne(newItem);  // Insert the item into the collection
    res.json(newItem);  // Respond with the inserted item
  } catch (err) {
    res.status(500).send('Error adding item');
  }
});

// POST /leaderboard - Add an item to the leaderboard and check for personal record/top 10 placement
app.post('/leaderboard', async (req, res) => {
  try {
    const { username, score, category } = req.body;  // Extract username, score, and category

    // Insert the new score into the collection
    const newItem = { username, score, category };
    await itemsCollection.insertOne(newItem);

    // Check if the score qualifies for the top 10 in this category
    const leaderboard = await itemsCollection
      .find({ category })
      .sort({ score: -1 })
      .limit(10)
      .toArray();

    let leaderboardPosition = -1;
    for (let i = 0; i < leaderboard.length; i++) {
      if (leaderboard[i].username === username && leaderboard[i].score === score) {
        leaderboardPosition = i + 1;  // Find the rank of the new score
        break;
      }
    }

    // Check if this is the user's personal record in this category
    const personalBest = await itemsCollection
      .find({ username, category })
      .sort({ score: -1 })
      .limit(1)
      .toArray();

    const isPersonalRecord = personalBest.length > 0 && personalBest[0].score <= score;

    res.json({ leaderboardPosition, isPersonalRecord });  // Return the rank and personal record status
  } catch (err) {
    console.error('Error adding item', err);
    res.status(500).send('Error adding item');
  }
});

// DELETE /items/:id - Delete an item from the Leaderboard collection by ID
app.delete('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;  // Extract the item ID from the request parameters
    const result = await itemsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.json({ message: `Item with ID ${id} deleted successfully` });  // Return success if item deleted
    } else {
      res.status(404).json({ message: `Item with ID ${id} not found` });  // Return 404 if item not found
    }
  } catch (err) {
    res.status(500).send('Error deleting item');
  }
});
