const { default: knex } = require("knex");

module.exports = {
    isNumberOfLengthN: function (number, length) {
        if (number) {
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
            return false;
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
            return false;
        }
        return rep;
    },

}