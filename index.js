const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

function verifyToken(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = header.split('')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
    })
    next();
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@azmain951.wvuu0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const fruitCollection = client.db('fruit-basket').collection('fruits');

        app.post('/login', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '30d'
            });
            res.send({ token });
        })

        app.get('/fruits', verifyToken, async (req, res) => {
            const decodedEmail = req.decoded.email;
            if (req.query.email) {
                if (req.query.email === decodedEmail) {
                    const email = req.query.email;
                    const query = { email };
                    const cursor = fruitCollection.find(query);
                    const fruits = await cursor.toArray();
                    console.log(fruits);
                    res.send(fruits);
                }
                else {
                    res.status(403).send({ message: 'Forbidden Access' })
                }
            }
            else {
                const query = {};
                const cursor = fruitCollection.find(query);
                const fruits = await cursor.toArray();
                res.send(fruits);
            }
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

        app.delete('/fruits/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await fruitCollection.deleteOne(query);
            res.send(result);
        })
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