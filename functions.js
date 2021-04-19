const validator = require("email-validator");

module.exports = {

    validateGameParams: function (req, res, next) {
        const { userId, gameName } = req.params;
        const regex = new RegExp(/^[a-zA-Z0-9_'\-]+$/);
    
        if (userId && !isNaN(userId) && gameName  && regex.test(gameName)) {
            next();
        } else {
            res.status(406).send({ msg: 'Invalid arguments' })
        }
    },
    isNumberOfLengthN: function (number, length) {
        if (number || number === 0) {
            return number.toString().length !== length || isNaN(number) ? false : true;
        } else {
            return false
        }
    },

    validateUserBody: function (req, res, next) {
        const usernameReg = new RegExp(/^[a-zA-Z0-9_\-]+$/);
        const countryReg = new RegExp(/^[a-zA-Z]+$/);
        const birthdate = new Date(req.body.birthdate).getTime()
        // username test
        if (!usernameReg.test(req.body.username)) res.status(406).send({msg: "Bad username"});
        // email test
        if (!validator.validate(req.body.email)) res.status(406).send({msg: "Bad email"});
        // country test
        if (!countryReg.test(req.body.country)) res.status(406).send({msg: "Bad country"});
        // birthdate test
        if (!(Date.now() > birthdate > 0)) res.status(406).send({msg: "Bad birthdate, unlucky dude"});
        next();
    },

    createNewUser: async function (DTO, knex) {
        const columns = Object.keys(DTO);
        const rows = Object.values(DTO);

        const sqlQuery = `
            INSERT INTO user (${columns.join(',')})
            VALUES (${rows.map(value => `'${value}'`).join(",")})
        `;

        let request;
        try {
            request = await knex.raw(sqlQuery);
        } catch (error) {
            console.error('error : ', error);
            return false;
        }
        return request;
    },

    createNewCard: async function (newCard, knex) {
        const columns = Object.keys(newCard);
        const rows = Object.values(newCard);

        const sqlQuery = `
            INSERT INTO payment (${columns.join(',')})
            VALUES (${rows.join(',')})
        `;

        try {
            await knex.raw(sqlQuery);
        } catch (error) {
            console.error('error : ', error);
            return false;
        }
        return true;
    },

    deleteCard: async function (card, knex) {
        const  sqlQuery = `
            DELETE FROM payment
            WHERE USER_ID = ${card.USER_ID}
            AND CARD_ID = ${card.CARD_ID} 
        `;

        try {
            await knex.raw(sqlQuery);
        } catch (e) {
            console.error('error: ', e);
            return false
        }
        return true;
    },

    deleteCards: async function (card, knex) {
        const  sqlQuery = `
            DELETE FROM payment
            WHERE USER_ID = ${card.USER_ID}
        `;

        try {
            await knex.raw(sqlQuery);
        } catch (e) {
            console.error('error: ', e);
            return false;
        }
        return true;
    },

    getCards: async function (USER_ID, knex) {
        let rep;
        try {
            rep = await knex.select().from('PAYMENT').where('USER_ID', USER_ID);
        } catch (e) {
            console.error('error: ', e);
            return [];
        }
        return rep;
    },

    getCard: async function (card, knex) {
        let rep;
        try {
            rep = await knex.select().from('PAYMENT').where({
                CARD_ID: card.CARD_ID,
                USER_ID: card.USER_ID
            })
        } catch (e) {
            console.error('error: ', e);
            return [];
        }
        return rep;
    },

    insertNewGame: async function (newGame, knex) {
        const columns = Object.keys(newGame);
        const rows = Object.values(newGame);

        const sqlQuery = `
            INSERT INTO library (${columns.join(',')}, STATUS, SUSPENDED)
            VALUES (${rows.join(',')}, 'Active', false)
        `;

        let response;
        try {
            response = await knex.raw(sqlQuery);
        } catch (error) {
            console.error('error : ', error);
            return false;
        }
        return response;
    },

    setStatus: async function (status, knex) {

        const statusList = {
            0: 'Inactive',
            1: 'Active',
            10: 'Suspended'
        };

        const sqlQuery = `
            UPDATE library
            SET STATUS = "${statusList[status.STATUS]}"
            ${status.STATUS == 10 ? ', SUSPENDED = 1' : ''}
            WHERE USER_ID = ${status.USER_ID}
            AND GAME_NAME = ${status.GAME_NAME};
        `;
        
        let response;
        try {
            response = await knex.raw(sqlQuery);
        } catch (e) {
            console.error('error: ', e);
            return false;
        }
        return response;
    },

    insertNewBan: async function (newBan, knex) {
        const columns = Object.keys(newBan);
        const rows = Object.values(newBan);
        columns.pop();
        rows.pop();

        const sqlQuery = `
        INSERT INTO suspended(${columns.join(',')}, LIBRARY_ID)
        VALUES (${rows.join(',')}, (SELECT LIBRARY_ID FROM library WHERE USER_ID = ${newBan.USER_ID} AND GAME_NAME = ${newBan.GAME_NAME}))
        `;

        const newStatus = {
            STATUS: 10,
            USER_ID: newBan.USER_ID,
            GAME_NAME: `${newBan.GAME_NAME}`
        };

        this.setStatus(newStatus, knex);

        try {
            response = await knex.raw(sqlQuery);
        } catch (e) {
            console.error('error: ', e);
            return false;
        }
        return response;
    },

    setWastedTime: async function (DTO, knex) {

        const sqlQuery = `
            UPDATE library
            SET WASTED_TIME = "${DTO.WASTED_TIME}"
            WHERE USER_ID = ${DTO.USER_ID}
            AND GAME_NAME = ${DTO.GAME_NAME};
        `;
        
        let response;
        try {
            response = await knex.raw(sqlQuery);
        } catch (e) {
            console.error('error: ', e);
            return false;
        }
        return response;
    },
}