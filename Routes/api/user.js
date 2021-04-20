const { Router } = require('express');
const knex = require('../../database');

const bcrypt = require('bcrypt');

const router = Router();
const tools = require('../../functions');


// Create User

router.post('/create', tools.validateInsertUserBody, (req, res) => {
    bcrypt.hash(req.body.password, 10).then(async function(hash) {
        const user = {
            PLATEFORME_ID: req.body.platId,
            USERNAME: req.body.username,
            EMAIL: req.body.email,
            PWD: hash,
            JOINED_DATE: Date.now(),
            BIRTHDATE: req.body.birthdate,
            COUNTRY: req.body.country
        }
    
        const response = await tools.insertNewUser(user, knex);

        res.send( response[0].affectedRows ? 'created' : 'Error');

    });
});

// Login check

router.post('/login', tools.validateLoginBody, async (req, res) => {
    const login = {
        PLATEFORME_ID: req.body.platId,
        USERNAME: req.body.username,
        PWD: req.body.password,
    }

    let user_hash;

    try {
        user_hash = await knex.select("PWD").from("user").where({
            'PLATEFORME_ID': login.PLATEFORME_ID,
            'USERNAME': login.USERNAME
        });
    } catch (e) {
        console.error('error: ', e);
    }

    bcrypt.compare(login.PWD, user_hash[0].PWD).then(result => {
        res.send(result ? `Welcome ${login.USERNAME} !`: "Password and / or username don't match");
    })
});

module.exports = router;