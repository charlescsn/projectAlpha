const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const tools = require('./functions');
const knex = require('./database');

const userRoute = require('./Routes/api/user');
const paymentRoute = require('./Routes/api/payment');
const gameRoute = require('./Routes/api/game');
const seqrityRoute = require('./Routes/api/seqrity');


app.get('/', (req, res) => {
    res.send('Hello World');
})

// User

app.use('/api/user', userRoute);

// Payment

app.use('/api/payment', paymentRoute);

// Games

app.use('/api/game', gameRoute);

// Seqrity

app.use('/api/security', seqrityRoute);


app.listen(3000);