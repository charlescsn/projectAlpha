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
        res.send('Request couldn\' be sent');
        return;
    }
    
    if (!tools.isNumberOfLengthN(newCard.CVC, 3)) {
        res.send('Request couldn\' be sent');
        return;
    }
    
    if (isNaN(req.params.userId)) {
        res.send('Request couldn\' be sent');
        return;
    }

    res.send(tools.createNewCard(newCard, knex) ? 'good': 'Request couldn\' be sent');


})

app.post('/api/:userId/payment/delete/:cardId', (req, res) => {
    const card = {
        USER_ID: req.params.userId,
        PAYMENT_ID: req.params.cardId
    }

    if (isNaN(req.params.userId)) {
        res.send('Request couldn\' be sent');
        return;
    }

    if (isNaN(req.params.cardId)) {
        res.send('Request couldn\' be sent');
        return;
    }

    res.send(tools.deleteCard(card, knex) ? 'good': 'Request couldn\' be sent');
})

app.post('/api/:userId/payment/cards/delete', (req, res) => {
    const card = {
        USER_ID: req.params.userId
    }

    if (isNaN(req.params.userId)) {
        res.send('Request couldn\' be sent');
        return;
    }

    res.send(tools.deleteCards(card, knex) ? 'good': 'Request couldn\' be sent');
})



app.listen(3000);