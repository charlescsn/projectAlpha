const express = require('express');
const app = express();




app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const tools = require('./functions');
const knex = require('./database');

const userRoute = require('./Routes/api/user');
const gameRoute = require('./Routes/api/game');


app.get('/', (req, res) => {
    res.send('Hello World');
})

// user

app.post('/api/user/login', async (req, res) => {
    const login = {
        USERNAME: req.body.username,
        PWD: req.body.password
    };
    let user_hash;

    const regex = new RegExp(/^[a-zA-Z0-9_\-]+$/);
    if (!regex.test(login.USERNAME)) {
        res.send("t'as essayé de nous entuber petite p*te?");
        return;
    }

    try {
        user_hash = await knex.select("PWD").from("user").where('USERNAME', login.USERNAME);
    } catch (e) {
        console.error('error: ', e);
    }

    bcrypt.compare(login.PWD, user_hash[0].PWD).then(result => {
        if (result) {
            res.send('all good');
        } else {
            res.send('all wrong');
        }
    })
})

// Payment

app.post('/api/:userId/payment/card/new', (req, res) => {
    console.log(req.params);
    const newCard = {
        USER_ID : req.params.userId,
        CARD: req.body.card,
        CVC: req.body.CVC
    }

    // verifs

 
    if (!tools.isNumberOfLengthN(newCard.CARD, 4)) {
        res.send('Request couldn\'t be sent');
        return;
    }
    
    if (!tools.isNumberOfLengthN(newCard.CVC, 3)) {
        res.send('Request couldn\'t be sent');
        return;
    }
    
    if (isNaN(req.params.userId)) {
        res.send('Request couldn\'t be sent');
        return;
    }

    res.send(tools.createNewCard(newCard, knex) ? 'good': 'Request couldn\'t be sent');


})

app.post('/api/:userId/payment/delete/:cardId', (req, res) => {
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

    res.send(tools.deleteCard(card, knex) ? 'good': 'Request couldn\'t be sent');
})

app.post('/api/:userId/payment/cards/delete', (req, res) => {
    const card = {
        USER_ID: req.params.userId
    }

    if (isNaN(card.USER_ID)) {
        res.send('Request couldn\'t be sent');
        return;
    }

    res.send(tools.deleteCards(card, knex) ? 'good': 'Request couldn\'t be sent');
})

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


// Games

app.use('/api/game', gameRoute);


app.listen(3000);