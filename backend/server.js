const express = require('express');
const cors = require('cors');  // Import cors
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();  // Load environment variables from .env file

const app = express();  // Create an instance of Express
app.use(cors());  // Enable CORS for all routes
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db, itemsCollection, usersCollection;

client.connect()
  .then(() => {
    db = client.db("Quizzle");
    itemsCollection = db.collection("Leaderboard");
    usersCollection = db.collection("Users");
    console.log('Connected to MongoDB');

    // Start the server after successful connection
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);  // Exit the process if connection fails
  });

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      console.error('User already exists'); // Log error
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
    // Find the user in the database
    const user = await usersCollection.findOne({ username });
    
    // Log the found user or null if not found
    console.log('Found user:', user);
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    
    // Log the password match result
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error('Error logging in user:', err);
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
    const { category } = req.query; // Get category from query string
    const query = category ? { category: parseInt(category) } : {}; // Filter by category if provided

    const leaderboard = await itemsCollection
      .find(query)
      .sort({ score: -1 }) // Sort by points descending
      .limit(10)            // Limit to top 10
      .toArray();

    res.json(leaderboard); // Send the filtered top 10 sorted entries to the frontend
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
