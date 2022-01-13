const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}.gmeoo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const run = async() => {
    try {
        await client.connect();

        const database = client.db(process.env.DB_NAME);
  
        const userCollection = database.collection(process.env.DB_COLLECTIONS_USER);
        const postCollection = database.collection(process.env.DB_COLLECTIONS_POST);


        // Code
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);
            res.json(result);
          });
    
          app.put('/users', async (req, res) => {
            const newUser = req.body;
            const filter = {email: newUser.email};
            const option = {upsert: true};
    
            const upsertedDoc = {
                $set: newUser
            };
            
            const result = await userCollection.updateOne(filter, upsertedDoc, option);
            res.json(result);
          });
    
          app.put('/users/:email', async (req, res) => {
            const { email } = req.params;
            const filter = { email: email };
            const replacedDoc = {
                $set: { isAdmin: true }
            };
    
            const result = await userCollection.updateOne(filter, replacedDoc);
            res.json(result);
          });
    
          app.get('/users/:email', async (req, res) => {
            const { email } = req.params;
            const query = { email: email };
    
            const matchedUser = await userCollection.findOne(query);
            
            if(matchedUser) {
              res.json(matchedUser);
            }
    
            else {
              res.send({});
            }
    
          });

          app.get('/prings', async (req, res) => {
            const query = {};
            const cursor = postCollection.find(query);
    
            const results = await cursor.toArray();
            
            if(results) {
              res.json(results);
            }
    
            else {
              res.send([]);
            }
    
          });

          app.get('/prings/:email', async (req, res) => {
            const { email } = req.params;
            const query = { email: email };
            
            const cursor = postCollection.find(query);
    
            const results = await cursor.toArray();
    
            if(results) {
                res.json(results);
            }
    
            else {
                res.send([]);
            }
  
          });

          app.delete('/prings/:id', async (req, res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) };
    
            const result = await postCollection.deleteOne(query);
            res.json(result);
          });

          app.post('/prings', async (req, res) => {
            const newOrder = req.body;
            const result = await postCollection.insertOne(newOrder);
            res.json(result);
          });

    } finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server Running Happily...');
});

app.listen(port, () => {
    console.log(`Listening at port ${port}`);
});