const { Router } = require('express');
const knex = require('../../database');

const bcrypt = require('bcrypt');

const router = Router();
const tools = require('../../functions');


// Create User

router.post('/create', tools.validateUserBody, (req, res) => {
    bcrypt.hash(req.body.password, 10).then(function(hash) {
        const user = {
            PLATEFORME_ID: req.body.platId,
            USERNAME: req.body.username,
            EMAIL: req.body.email,
            PWD: hash,
            JOINED_DATE: Date.now(),
            BIRTHDATE: req.body.birthdate,
            COUNTRY: req.body.country
        }

        // /!\ PROBLEME ICI FAUT REPARE
    
        const response = await tools.createNewUser(user, knex);

        res.send( response[0].affectedRows ? 'created' : 'Error')

    });
});

module.exports = router;

// app.post('/api/user/create', (req, res) => {
    
    
//     const user = {
//         PLATEFORME_ID: req.body.platId,
//         USERNAME: null,
//         EMAIL: null,
//         PWD: null,
//         JOINED_DATE: null,
//         BIRTHDATE: null,
//         COUNTRY: null
//     }

//     const regex = new RegExp(/^[a-zA-Z0-9_\-]+$/);
//     if (regex.test(req.body.username)) {
//         user.USERNAME = req.body.username;
//     } else {
//         res.send("t'as essayé de nous entuber petite p*te?");
//         return;
//     }

//     if (validator.validate(req.body.email)) {
//         user.EMAIL = req.body.email;
//     } else {
//         res.send('E.M.A.I.L troudbal, le truc avec un @test.fr');
//         return;
//     }

//     const regex2 = new RegExp(/^[a-zA-Z]+$/);
//     if (regex2.test(req.body.country)) {
//         user.COUNTRY = req.body.country;
//     } else {
//         res.send("tu nous prends pour des américains?");
//         return;
//     }

//     if ((new Date(req.body.joinedDate)).getTime() > 0) {
//         user.JOINED_DATE = req.body.joinedDate;
//     } else {
//         res.send("t'as fumé un joint?");
//         return;
//     }

//     if ((new Date(req.body.birthdate)).getTime() > 0) {
//         user.BIRTHDATE = req.body.birthdate;
//     } else {
//         res.send("t'as cru qu'on était né de la dernière pluie?");
//         return;
//     }   

//     bcrypt.hash(req.body.password, 10).then(async function(hash) {
//         user.PWD = hash;
//         const columns = Object.keys(user);
//         const values = Object.values(user);

//         const sqlQuery = `
//         INSERT INTO user (${columns.join(',')})
//             VALUES (${values.map(value => `'${value}'`).join(",")})
//         `;


//         try {
//             await knex.raw(sqlQuery);
//         } catch (e) {
//             console.error('error: ', e);
//         }

//         res.send('sent biaaaaaaaatch');
//     });
// })

// // user

// app.post('/api/user/login', async (req, res) => {
//     const login = {
//         USERNAME: req.body.username,
//         PWD: req.body.password
//     };
//     let user_hash;

//     const regex = new RegExp(/^[a-zA-Z0-9_\-]+$/);
//     if (!regex.test(login.USERNAME)) {
//         res.send("t'as essayé de nous entuber petite p*te?");
//         return;
//     }

//     try {
//         user_hash = await knex.select("PWD").from("user").where('USERNAME', login.USERNAME);
//     } catch (e) {
//         console.error('error: ', e);
//     }

//     bcrypt.compare(login.PWD, user_hash[0].PWD).then(result => {
//         if (result) {
//             res.send('all good');
//         } else {
//             res.send('all wrong');
//         }
//     })
// })