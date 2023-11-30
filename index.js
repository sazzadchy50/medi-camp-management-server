const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://medi-camp-management.web.app/",
      "https://medi-camp-management.firebaseapp.com/",
    ],
    credentials: true,
  })
);


const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access first" });
  }
  accessToken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wsx9xso.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const campCollection = client
      .db("medi-Camp-management")
      .collection("allCamp");
    const campRegisterCollection = client
      .db("medi-Camp-management")
      .collection("RegisteredCamp");
    const usersCollection = client
      .db("medi-Camp-management")
      .collection("users");
    const ratingsCollection = client
      .db("medi-Camp-management")
      .collection("FeedBack-and-Ratings");

    // camp data
    app.get("/api/v1/camp", async (req, res) => {
      const result = await campCollection.find().toArray();
      console.log(result);
      res.send(result);
    });

    app.get("/api/v1/camp-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campCollection.findOne(query);
      res.send(result);
    });
    app.post("/api/v1/add-a-camp", async (req, res) => {
      const campData = req.body;
      const result = await campCollection.insertOne(campData);
      res.send(result);
    });

    //camp register
    app.post("/api/v1/camp-register",verifyToken, async (req, res) => {
      const regData = req.body;
      const result = await campRegisterCollection.insertOne(regData);
      res.send(result);
    });
    //register camp management
    app.get("/api/v1/dashboard/manage-registered-camps", async (req, res) => {
      const result = await campRegisterCollection.find().toArray();
      res.send(result);
    });
    // update camp data
    app.get("/api/v1/dashboard/update-camp/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campCollection.findOne(query);
      res.send(result);
    });

    app.patch("api/v1/dashboard/update-camp/:campId", async (req, res) => {
      const data = req.body;
      const id = req.params.campId;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: data.name,
          fees: data.Fees,
          professionals: data.HealthcareProfessionals,
          specializedServices: data.specializedServices,
          venueLocation: data.venueLocation,
          targetedAudience: data.targetedAudience,
          description: data.Description,
          dateTime: data.scheduleDate,
          image: item.image,
          email: user.email,
        },
      };
      const result = await campCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    //delete camp
    app.delete("/api/v1/delete-camp/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campCollection.deleteOne(query);
      res.send(result);
    });
    // user data   
    app.post("/api/v1/users", async (req, res) => {
      const userData = req.body;
      console.log(userData);
      const result = await usersCollection.insertOne(userData);
      res.send(result);
    });

    // participant dashboard
    // feed back 
    app.post("/api/v1/feedback-and-ratings", async (req, res) => {
      const ratings = req.body;
      console.log(ratings);
      const result = await ratingsCollection.insertOne(ratings);
      res.send(result);
    });
    app.get("/api/v1/feedback-and-ratings", async (req, res) => {
      const result = await ratingsCollection.find().toArray();
      res.send(result);
    });

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
