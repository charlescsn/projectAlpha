const express = require('express');
const app = express();
const bcrypt = require('bcrypt');

const { request } = require('http');
const mysql = require('mysql');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'projectalpha'
    }
  });

// let con = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'projectalpha'
// })

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.post('/api/user/create', (req, res) => {
    const newUser = {
        PLATeFORME_ID: req.body.platId,
        USERNAME: req.body.username,
        EMAIL: req.body.email,
        PWD: req.body.password,
        PHONENUMBER: req.body.phoneNumber,
        JOINED_DATE: req.body.joinedDate,
        BIRTHDATE: req.body.birthdate,
        COUNTRY: req.body.country
    }

    bcrypt.hash(newUser.PWD, 10).then(async function(hash) {
        newUser.PWD = "'" + hash + "'";
        const columns = Object.keys(newUser);
        const values = Object.values(newUser);

        const sqlQuery = `
        INSERT INTO user (${columns.join(',')})
            VALUES (${values.join(',')})
        `;

        try {
            await knex.raw(sqlQuery);
        } catch (e) {
            console.error('error: ', e);
        }

        res.send('sent biaaaaaaaatch');
    });
})

app.post('/api/user/login', async (req, res) => {
    const login = {
        USERNAME: req.body.username,
        PWD: req.body.password
    }
    console.log(login);
    const regex = new RegExp(/^[a-zA-Z0-9_\-]+$/);
    if (!regex.test(login.USERNAME)) {
        res.send("t'as essayé de nous entuber petite p*te?")
    }

    
    const sqlQuery = `
    SELECT PWD FROM user
    WHERE USERNAME = ?
    `
    console.log(sqlQuery);
    try {
        user_hash = await knex.raw(sqlQuery, login.USERNAME);
    } catch (e) {
        console.error('error: ', e);
    }
    
    if (bcrypt.compare(login.USERNAME, user_hash)) {
        res.status(200).json({
            statusCode: 200,
            message: "Successful",
        })
    } else {
        res.status(200).json({
            statusCode: 400,
            message: "Wrong password",
        })
    }
})

app.listen(3000);