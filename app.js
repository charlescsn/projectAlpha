const express = require('express');
const app = express();




app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const tools = require('./functions');
const knex = require('./database');

const userRoute = require('./Routes/api/user');
const paymentRoute = require('./Routes/api/payment');
const gameRoute = require('./Routes/api/game');


app.get('/', (req, res) => {
    res.send('Hello World');
})

// Payment

app.get('/api/:userId/payment/cards', async (req, res) => {
    const USER_ID = req.params.userId;
    
    if (isNaN(USER_ID)) {
        res.send('Request couldn\'t be sent');
        return;
    }

    const rep = await tools.getCards(USER_ID, knex);
    res.status(200).json({
        statusCode: 200,
        message: "Successful",
        data: rep,
    });
})

app.get('/api/:userId/payment/card/:cardId', async (req, res) => {
    const card = {
        USER_ID: req.params.userId,
        CARD_ID: req.params.cardId
    }

    if (isNaN(card.USER_ID)) {
        res.send('Request couldn\'t be sent');
        return;
    }

    if (isNaN(card.CARD_ID)) {
        res.send('Request couldn\'t be sent');
        return;
    }

    const rep = await tools.getCard(card, knex);
    if (rep.length == 0) {
        res.status(404).json({
            statusCode: 404,
            message: "No data found :/",
        });
        return;
    }
    res.status(200).json({
        statusCode: 200,
        message: "Successful",
        data: rep,
    });
})

// User

app.use('/api/user', userRoute);

// Payment

app.use('/api/payment', paymentRoute);

// Games

app.use('/api/game', gameRoute);


app.listen(3000);