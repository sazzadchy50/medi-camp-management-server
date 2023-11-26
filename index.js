const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wsx9xso.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });


  async function run(){

    try {
         // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const campCollection = client.db("medi-Camp-management").collection("allCamp");
    const campRegisterCollection = client.db("medi-Camp-management").collection("RegisteredCamp");
    
    // camp data
    app.get('/api/v1/camp',async(req, res)=>{
        const result = await campCollection.find().toArray();
        res.send(result)
    })
    app.get('/api/v1/camp-details/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await campCollection.findOne(query);
      res.send(result)
    })
    app.post('/api/v1/add-a-camp', async(req, res)=>{
        const campData = req.body;
        const result = await campCollection.insertOne(campData);
        res.send(result);
    })
    
    //camp register 

    app.post('/api/v1/camp-register', async(req, res)=>{
      const regData = req.body;
      const result = await campRegisterCollection.insertOne(regData);
      res.send(result)
    })


     // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
  }

  run().catch(console.dir);

  app.get("/", (req, res) => {
    res.send("medi camp management server");
  });
  
  app.listen(port, () => {
    console.log(`medi camp management server on port ${port}`);
  });