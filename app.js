const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const validator = require("email-validator");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const tools = require('./functions');

const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'projectalpha'
    }
  });

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.post('/api/user/create', (req, res) => {
    
    
    const user = {
        PLATEFORME_ID: req.body.platId,
        USERNAME: null,
        EMAIL: null,
        PWD: null,
        JOINED_DATE: null,
        BIRTHDATE: null,
        COUNTRY: null
    }

    const regex = new RegExp(/^[a-zA-Z0-9_\-]+$/);
    if (regex.test(req.body.username)) {
        user.USERNAME = req.body.username;
    } else {
        res.send("t'as essayé de nous entuber petite p*te?");
        return;
    }

    if (validator.validate(req.body.email)) {
        user.EMAIL = req.body.email;
    } else {
        res.send('E.M.A.I.L troudbal, le truc avec un @test.fr');
        return;
    }

    const regex2 = new RegExp(/^[a-zA-Z]+$/);
    if (regex2.test(req.body.country)) {
        user.COUNTRY = req.body.country;
    } else {
        res.send("tu nous prends pour des américains?");
        return;
    }

    if ((new Date(req.body.joinedDate)).getTime() > 0) {
        user.JOINED_DATE = req.body.joinedDate;
    } else {
        res.send("t'as fumé un joint?");
        return;
    }

    if ((new Date(req.body.birthdate)).getTime() > 0) {
        user.BIRTHDATE = req.body.birthdate;
    } else {
        res.send("t'as cru qu'on était né de la dernière pluie?");
        return;
    }   

    bcrypt.hash(req.body.password, 10).then(async function(hash) {
        user.PWD = hash;
        const columns = Object.keys(user);
        const values = Object.values(user);

        const sqlQuery = `
        INSERT INTO user (${columns.join(',')})
            VALUES (${values.map(value => `'${value}'`).join(",")})
        `;


        try {
            await knex.raw(sqlQuery);
        } catch (e) {
            console.error('error: ', e);
        }

        res.send('sent biaaaaaaaatch');
    });
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

// Games

app.post('/api/:userId/game/:gameName', (req,res) => {
    
    const newGame = {
        USER_ID: req.params.userId,
        GAME_NAME: `'${req.params.gameName}'`,
        JOINED_DATE: Date.now()        
    }

    
    if (isNaN(newGame.USER_ID)) {
        res.send('Request couldn\'t be sent');
        return;
    }

    const regex = new RegExp(/^[a-zA-Z0-9_'\-]+$/);
    if (!regex.test(newGame.GAME_NAME)) {
        res.send("t'as essayé de nous entuber petite p*te?");
        return;
    }

    res.send(tools.insertNewGame(newGame, knex) ? 'created': 'Request couldn\'t be sent');
})

app.post('/api/:userId/game/update/:gameName', async (req,res) => {
    
    const newStatus = {
        STATUS: req.body.status,
        USER_ID: req.params.userId,
        GAME_NAME: `'${req.params.gameName}'`
    }

    if (!tools.isNumberOfLengthN(newStatus.STATUS, 1) || (newStatus.STATUS != 0 && newStatus.STATUS != 1)) {
        res.send('Request couldn\'t be sent1');
        return;
    }
    
    if (isNaN(newStatus.USER_ID)) {
        res.send('Request couldn\'t be sent2');
        return;
    }

    const regex = new RegExp(/^[a-zA-Z0-9_'\-]+$/);
    if (!regex.test(newStatus.GAME_NAME)) {
        res.send("t'as essayé de nous entuber petite p*te?");
        return;
    }
    let test = await tools.setStatus(newStatus, knex);
    console.log('yoyo ',test[0].changedRows);

    res.send( test[0].changedRows ? 'updated': 'Error');
})


app.listen(3000);