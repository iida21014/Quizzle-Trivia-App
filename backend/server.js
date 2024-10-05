const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db, itemsCollection;

// Connect to MongoDB and start the server once connected
client.connect()
  .then(() => {
    db = client.db("Quizzle");
    itemsCollection = db.collection("Leaderboard");
    console.log('Connected to MongoDB');
    
    // Start the server after successful connection
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);  // Exit the process if connection fails
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

// GET  TOP 10
app.get('/leaderboard', async (req, res) => {
   try {
      const leaderboard = await itemsCollection
                                  .find()
                                  .sort({ score: -1 }) // Sort by points descending
                                  .limit(10)            // Limit to top 10
                                  .toArray();
      res.json(leaderboard); // Send the top 10 sorted entries to the frontend
   } catch (err) {
     res.status(500).send('Error fetching items');
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
});
