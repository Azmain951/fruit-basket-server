const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://fbuser1:GxvoqZQb4XOytMcm@azmain951.wvuu0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const fruitCollection = client.db('fruit-basket').collection('fruits');

        app.get('/fruits', async (req, res) => {
            const query = {};
            const cursor = fruitCollection.find(query);
            const fruits = await cursor.toArray();
            res.send(fruits);
        });

        app.get('/fruits/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await fruitCollection.findOne(query);
            res.send(result);
        });

        app.post('/fruits', async (req, res) => {
            const newItem = req.body;
            console.log(newItem);
            const result = await fruitCollection.insertOne(newItem);
            res.send(result);
        })

        app.put('/fruits/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const updatedQuantity = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            console.log(updatedQuantity);
            const updatedFruit = {
                $set: {
                    quantity: updatedQuantity.quantity
                }
            };
            const result = await fruitCollection.updateOne(filter, updatedFruit, options);
            res.send(result);
        });
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', async (req, res) => {
    res.send('Fruit Basket Server is Running');
});

app.listen(port, (req, res) => {
    console.log('listening to port: ', port);
});