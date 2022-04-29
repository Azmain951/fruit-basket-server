const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    res.send('Fruit Basket Server is Running');
});

app.listen(port, (req, res) => {
    console.log('listening to port: ', port);
});