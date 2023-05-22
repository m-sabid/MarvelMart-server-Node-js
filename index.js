const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGODB_URI;

// Enable CORS
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// API ENDPOINTS
// -------------

// MongoDB connection and server start
async function startServer() {
  try {
    await client.db("admin").command({ ping: 1 });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// POST API for adding a toy
app.post("/api/toys", async (req, res) => {
  try {
    const {
      seller,
      sellerEmail,
      toyName,
      subCategory,
      price,
      quantity,
      descriptions,
      photoURL,
      rating,
    } = req.body;

    const toy = {
      seller,
      sellerEmail,
      toyName,
      subCategory,
      price,
      quantity,
      descriptions,
      photoURL,
      rating,
    };

    const db = client.db("toydb");
    const collection = db.collection("toys");

    const result = await collection.insertOne(toy);
    toy._id = result.insertedId;

    res.status(201).json({ message: "Toy added successfully.", toy });
  } catch (error) {
    res.status(500).json({ message: "Error adding toy.", error });
  }
});

// GET API to fetch all toys
app.get("/api/toys", async (req, res) => {
  try {
    const db = client.db("toydb");
    const collection = db.collection("toys");

    const toys = await collection.find().toArray();

    res.status(200).json({ toys });
  } catch (error) {
    res.status(500).json({ message: "Error fetching toys.", error });
  }
});

// GET API to fetch a single toy by id
app.get("/api/toys/:id", async (req, res) => {
  try {
    const toyId = req.params.id;

    const db = client.db("toydb");
    const collection = db.collection("toys");

    const toy = await collection.findOne({ _id: new ObjectId(toyId) });

    if (toy) {
      res.status(200).json({ toy });
    } else {
      res.status(404).json({ message: "Toy not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching toy.", error });
  }
});

// GET API to fetch featured products related to Captain America
app.get("/api/featured-products", async (req, res) => {
  try {
    const db = client.db("toydb");
    const collection = db.collection("toys");

    // Filter for toys related to Captain America
    const featuredToys = await collection.find({
      toyName: { $regex: "Captain America", $options: "i" },
    }).toArray();

    res.status(200).json({ featuredToys });
  } catch (error) {
    res.status(500).json({ message: "Error fetching featured products.", error });
  }
});


// Update API to update a single toy
app.patch("/api/toys/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateToys = req.body;

  const updateDoc = {
    $set: {
      price: updateToys.price,
      descriptions: updateToys.descriptions,
      quantity: updateToys.quantity,
      rating: updateToys.rating,
    },
  };

  try {
    const db = client.db("toydb");
    const collection = db.collection("toys");
    
    const result = await collection.updateOne(filter, updateDoc);
    if (result.modifiedCount === 1) {
      res.status(200).json({ message: "Toy updated successfully" });
    } else {
      res.status(404).json({ message: "Toy not found" });
    }
  } catch (error) {
    console.error("Error updating toy:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



// DELETE API to delete a toy
app.delete("/api/toys/:id", async (req, res) => {
  try {
    const toyId = req.params.id;

    const db = client.db("toydb");
    const collection = db.collection("toys");

    const result = await collection.deleteOne({ _id: new ObjectId(toyId) });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Toy not found." });
    } else {
      res.status(200).json({ message: "Toy deleted successfully." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting toy.", error });
  }
});

// GET API to fetch toys sorted by price in descending order
app.get("/api/toys/sort/descending", async (req, res) => {
  try {
    const db = client.db("toydb");
    const collection = db.collection("toys");

    const toys = await collection.find().sort({ price: -1 }).toArray();

    res.status(200).json({ toys });
  } catch (error) {
    res.status(500).json({ message: "Error fetching toys.", error });
  }
});

// GET API to fetch toys sorted by price in ascending order
app.get("/api/toys/sort/ascending", async (req, res) => {
  try {
    const db = client.db("toydb");
    const collection = db.collection("toys");

    const toys = await collection.find().sort({ price: 1 }).toArray();

    res.status(200).json({ toys });
  } catch (error) {
    res.status(500).json({ message: "Error fetching toys.", error });
  }
});

// GET API to fetch toys of a specific logged-in user
app.get("/api/my-toys", async (req, res) => {
  try {
    const userId = req.query;

    const db = client.db("toydb");
    const collection = db.collection("toys");

    const toys = await collection.find({ sellerEmail: userId.email }).toArray();

    res.status(200).json({ toys });
  } catch (error) {
    res.status(500).json({ message: "Error fetching toys.", error });
  }
});

startServer();
