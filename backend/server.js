const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();  // Load environment variables from .env file

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI; // Ensure your existing MongoDB URI points to your database
const client = new MongoClient(uri);

let db, itemsCollection, usersCollection;

client.connect()
  .then(() => {
    db = client.db("Quizzle"); // Connect to your existing database
    itemsCollection = db.collection("Leaderboard");
    usersCollection = db.collection("Users");
    console.log('Connected to MongoDB');

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = decoded; // Store user info in request object
    next();
  });
};

// Register user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      console.error('User already exists');
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword };
    await usersCollection.insertOne(newUser);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected endpoint to fetch user info
app.get('/protected', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: { username: user.username } });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT update username
app.put('/update-username', authenticateToken, async (req, res) => {
  const { username } = req.body;

  // Validate the new username
  if (!username || username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
  }

  try {
    const userId = req.user.userId; // Use userId from the JWT

    console.log('Attempting to update username for userId:', userId);

    // Check if the new username already exists in the database
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    // Update the username in the database
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },  // Find user by ID
      { $set: { username } }          // Set the new username
    );

    // Log the result of the update operation
    console.log('Update result:', result);

    // Check if the user was updated
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'User not found or username was not updated.' });
    }

    // Return a success message and the updated username
    return res.json({ message: 'Username updated successfully', user: { username } });

  } catch (error) {
    console.error('Error updating username:', error);
    return res.status(500).send('Error updating username');
  }
});

// DELETE user account
app.delete('/delete-user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Get user ID from the token

    // Find and delete the user from the collection
    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: 'User account deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// GET all items
app.get('/items', async (req, res) => {
  try {
    const items = await itemsCollection.find().toArray();
    res.json(items);
  } catch (err) {
    res.status(500).send('Error fetching items');
  }
});

// GET TOP 10 with category filter
app.get('/leaderboard', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category: parseInt(category) } : {};

    const leaderboard = await itemsCollection
      .find(query)
      .sort({ score: -1 })
      .limit(10)
      .toArray();

    res.json(leaderboard);
  } catch (err) {
    res.status(500).send('Error fetching leaderboard');
  }
});

// POST to database
app.post('/items', async (req, res) => {
  try {
    const newItem = req.body;
    await itemsCollection.insertOne(newItem);
    res.json(newItem);
  } catch (err) {
    res.status(500).send('Error adding item');
  }
});

// DELETE an item by ID
app.delete('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await itemsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.json({ message: `Item with ID ${id} deleted successfully` });
    } else {
      res.status(404).json({ message: `Item with ID ${id} not found` });
    }
  } catch (err) {
    res.status(500).send('Error deleting item');
  }
});
