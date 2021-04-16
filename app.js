const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const validator = require("email-validator");

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

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.post('/api/user/create', (req, res) => {
    
    
    const newUser = {
        PLATEFORME_ID: req.body.platId,
        USERNAME: req.body.username,
        EMAIL: null,
        PWD: req.body.password,
        PHONENUMBER: req.body.phoneNumber,
        JOINED_DATE: req.body.joinedDate,
        BIRTHDATE: req.body.birthdate,
        COUNTRY: req.body.country
    }
    
    if (validator.validate(req.body.email)) {
        newUser.EMAIL = req.body.email;
    } else {
        res.send('E.M.A.I.L troudbal, le truc avec un @test.fr');
    }
    

    bcrypt.hash(newUser.PWD, 10).then(async function(hash) {
        newUser.PWD = hash;
        const columns = Object.keys(newUser);
        const values = Object.values(newUser);

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

app.post('/api/user/login', async (req, res) => {
    const login = {
        USERNAME: req.body.username,
        PWD: req.body.password
    };
    let user_hash;

    const regex = new RegExp(/^[a-zA-Z0-9_\-]+$/);
    if (!regex.test(login.USERNAME)) {
        res.send("t'as essayé de nous entuber petite p*te?");
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
            res.send('all wrong')
        }
    })
})

app.listen(3000);