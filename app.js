const express = require('express');
const app = express();

const knex = require('./database');
const tools = require('./functions');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoute = require('./Routes/api/user');
const paymentRoute = require('./Routes/api/payment');
const gameRoute = require('./Routes/api/game');
const seqrityRoute = require('./Routes/api/seqrity');

require('dotenv').config();



app.get('/', (req, res) => {
    res.send('Hello World');
})

app.use('/api/:apiKey', tools.validateApiKey, async (req, res, next) => {

    const response = await tools.checkApiKey(req.params.apiKey, knex);

    if (response) {
        next();
    } else {
        res.status(406).send({msg: 'U get out of here or check pricing page'});
    }

})

// User

app.use('/api/:apiKey/user', userRoute);

// Payment

app.use('/api/:apiKey/payment', paymentRoute);

// Games

app.use('/api/:apiKey/game', gameRoute);

// Seqrity

app.use('/api/:apiKey/security', seqrityRoute);



app.listen(3000);