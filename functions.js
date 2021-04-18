const { default: knex } = require("knex");

module.exports = {
    isNumberOfLengthN: function (number, length) {
        if (number || number === 0) {
            return number.toString().length !== length || isNaN(number) ? false : true;
        } else {
            return false
        }
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

        try {
            await knex.raw(sqlQuery);
        } catch (error) {
            console.error('error : ', error);
            return false;
        }
        return true;
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
            WHERE USER_ID = ${status.USER_ID}
            AND GAME_NAME = ${status.GAME_NAME};
        `;
        let test;
        try {
            test = await knex.raw(sqlQuery);
        } catch (e) {
            console.error('error: ', e);
            return false;
        }
        console.log('test: ',test);
        return test;
    },

}