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

// API END POINTs
// -----------

// MongoDB connection and data insertion
          // async function insertData() {
          //   try {
          //     await client.connect();
          //     const db = client.db("toydb");
          //     const collection = db.collection("toys");
          //     await collection.insertMany(toysData);
          //     console.log("Data inserted successfully into MongoDB.");
          //   } catch (error) {
          //     console.error("Error inserting data into MongoDB:", error);
          //   } finally {
          //     await client.close();
          //   }
          // }
          // insertData()



app.get("/", function (req, res) {
  res.send("hello world");
});

// POST API for adding a toy
app.post("/api/toys", async (req, res) => {
  try {
    const { seller, name, subCategory, price, quantity, descriptions } = req.body;
    const toy = { seller, name, subCategory, price, quantity, descriptions };
    

    await client.connect();
    const db = client.db("toydb");
    const collection = db.collection("toys");

    const result = await collection.insertOne(toy);
    toy._id = result.insertedId;

    res.status(201).json({ message: "Toy added successfully.", toy });
  } catch (error) {
    res.status(500).json({ message: "Error adding toy.", error });
  } finally {
    await client.close();
  }
});

// GET API to fetch all toys
app.get("/api/toys", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("toydb");
    const collection = db.collection("toys");

    const toys = await collection.find().toArray();

    res.status(200).json({ toys });
  } catch (error) {
    res.status(500).json({ message: "Error fetching toys.", error });
  } finally {
    await client.close();
  }
});

// GET API to fetch a single toy
app.get("/api/toys/:id", async (req, res) => {
  try {
    const toyId = req.params.id;

    await client.connect();
    const db = client.db("toydb");
    const collection = db.collection("toys");

    const toy = await collection.findOne({ _id: ObjectId(toyId) });

    if (!toy) {
      res.status(404).json({ message: "Toy not found." });
    } else {
      res.status(200).json({ toy });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching toy.", error });
  } finally {
    await client.close();
  }
});

// GET API to search a toy by ID
app.get("/api/toys/:id", async (req, res) => {
  try {
    const toyId = req.params.id;

    await client.connect();
    const db = client.db("toydb");
    const collection = db.collection("toys");

    const toy = await collection.findOne({ _id: ObjectId(toyId) });

    if (!toy) {
      res.status(404).json({ message: "Toy not found." });
    } else {
      res.status(200).json({ toy });
    }
  } catch (error) {
    res.status(500).json({ message: "Error searching for toy.", error });
  } finally {
    await client.close();
  }
});


// PUT API to update a toy
app.put("/api/toys/:id", async (req, res) => {
  try {
    const toyId = req.params.id;
    const { seller, name, subCategory, price, quantity } = req.body;

    await client.connect();
    const db = client.db("toydb");
    const collection = db.collection("toys");

    const result = await collection.updateOne(
      { _id: ObjectId(toyId) },
      {
        $set: { seller, name, subCategory, price, quantity },
      }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: "Toy not found." });
    } else {
      res.status(200).json({ message: "Toy updated successfully." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating toy.", error });
  } finally {
    await client.close();
  }
});

// DELETE API to delete a toy
app.delete("/api/toys/:id", async (req, res) => {
  try {
    const toyId = req.params.id;

    await client.connect();
    const db = client.db("toydb");
    const collection = db.collection("toys");

    const result = await collection.deleteOne({ _id: ObjectId(toyId) });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Toy not found." });
    } else {
      res.status(200).json({ message: "Toy deleted successfully." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting toy.", error });
  } finally {
    await client.close();
  }
});

// MongoDB connection and server start
async function startServer() {
  try {
    await client.connect();
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

startServer();
