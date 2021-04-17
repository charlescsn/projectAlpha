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

}