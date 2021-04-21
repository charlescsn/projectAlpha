const validator = require("email-validator");

const isNumberOfLengthN = function (number, length) {
    if (number || number === 0) {
        return number.toString().length !== length || isNaN(number) ? false : true;
    } else {
        return false
    }
};

const validateGameName = function (req, res, next) {
    const { gameName } = req.params;
    const regex = new RegExp(/^[a-zA-Z0-9_'\-]+$/);

    if (!(gameName && regex.test(gameName))) res.status(406).send({ msg: 'Bad gameName' }) 
    else next();
}; 

const validateInsertUserBody = function (req, res, next) {
    const usernameReg = new RegExp(/^[a-zA-Z0-9_\-]+$/);
    const countryReg = new RegExp(/^[a-zA-Z]+$/);
    const birthdate = new Date(req.body.birthdate).getTime();
    // username test
    if (!usernameReg.test(req.body.username)) res.status(406).send({msg: "Bad username"});
    // email test
    else if (!validator.validate(req.body.email)) res.status(406).send({msg: "Bad email"});
    // country test
    else if (!countryReg.test(req.body.country)) res.status(406).send({msg: "Bad country"});
    // birthdate test
    else if (!(Date.now() > birthdate > 0)) res.status(406).send({msg: "Bad birthdate, unlucky dude"});
    else next();
};

const validateUsername = function (req, res, next) {
    const usernameReg = new RegExp(/^[a-zA-Z0-9_\-]+$/);
    // username test
    if (!usernameReg.test(req.body.username)) res.status(406).send({msg: "Bad username"});
    else next();
};

const validateUserId = async function (req, res, next) {
    if (isNaN(req.params.userId)) res.status(406).send({msg: "Bad userId"});
    else next();
};

const validateCardId = async function (req, res, next) {
    // cardId test
    if (isNaN(req.params.cardId)) res.status(406).send({msg: "Bad cardId"});
    // // userId test
    // if (isNaN(req.params.userId)) res.status(406).send({msg: "Bad userId"});
    else next();
};

const validateInsertCard = async function (req, res, next) {
    // card test
    if (!isNumberOfLengthN(req.body.card, 4)) res.status(406).send({msg: "Bad card"});
    // CVC test
    else if (!isNumberOfLengthN(req.body.CVC, 3)) res.status(406).send({msg: "Bad CVC"});
    // userId test
    else if (isNaN(req.params.userId)) res.status(406).send({msg: "Bad userId"});
    else next();
};

const insertNewUser = async function (DTO, knex) {
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
};

const getUser = async function (username, knex) {
    let rep;
    try {
        rep = await knex
        .select('USER_ID', 'USERNAME', 'EMAIL', 'PHONENUMBER', 'JOINED_DATE', 'BIRTHDATE', 'COUNTRY')
        .from('user')
        .where('USERNAME', username);
    } catch (e) {
        console.error('error: ', e);
        return [];
    }
    return rep;
};

const insertNewCard = async function (DTO, knex) {
    const columns = Object.keys(DTO);
    const rows = Object.values(DTO);

    const sqlQuery = `
        INSERT INTO payment (${columns.join(',')})
        VALUES (${rows.join(',')})
    `;

    let response;
    try {
        response = await knex.raw(sqlQuery);
    } catch (error) {
        console.error('error : ', error);
        return false;
    }
    return response;
};

const deleteCard = async function (DTO, knex) {
    const  sqlQuery = `
        DELETE FROM payment
        WHERE USER_ID = ${DTO.USER_ID}
        AND CARD_ID = ${DTO.CARD_ID} 
    `;

    let response;
    try {
        response = await knex.raw(sqlQuery);
    } catch (e) {
        console.error('error: ', e);
        return false
    }
    return response;
};

const deleteCards = async function (USER_ID, knex) {
    const  sqlQuery = `
        DELETE FROM payment
        WHERE USER_ID = ${USER_ID}
    `;

    let response;
    try {
        response = await knex.raw(sqlQuery);
    } catch (e) {
        console.error('error: ', e);
        return false;
    }
    return response;
};

const getCards = async function (USER_ID, knex) {
    let rep;
    try {
        rep = await knex.select().from('PAYMENT').where('USER_ID', USER_ID);
    } catch (e) {
        console.error('error: ', e);
        return [];
    }
    return rep;
};

const getCard = async function (card, knex) {
    let response;
    try {
        response = await knex.select().from('payment').where({
            CARD_ID: card.CARD_ID,
            USER_ID: card.USER_ID
        })
    } catch (e) {
        console.error('error: ', e);
        return [];
    }
    return response;
};

const insertNewGame = async function (newGame, knex) {
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
};

const setStatus = async function (status, knex) {

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
};

const insertNewBan = async function (newBan, knex) {
    const columns = Object.keys(newBan);
    const rows = Object.values(newBan);
    columns.pop();
    rows.pop();

    const sqlQuery = `
    INSERT INTO suspended(${columns.join(',')}, LIBRARY_ID)
    VALUES (${rows.join(',')}, (SELECT LIBRARY_ID FROM library WHERE USER_ID = ${newBan.USER_ID} AND GAME_NAME = ${newBan.GAME_NAME}))
    `;

    console.log(sqlQuery);
    const newStatus = {
        STATUS: 10,
        USER_ID: newBan.USER_ID,
        GAME_NAME: `${newBan.GAME_NAME}`
    };

    setStatus(newStatus, knex);

    try {
        response = await knex.raw(sqlQuery);
    } catch (e) {
        console.error('error: ', e);
        return false;
    }
    return response;
};

const setWastedTime = async function (DTO, knex) {

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
};

const getStatus = async function (DTO, knex) {
    let response;
    try {
        response = await knex.select("STATUS").from('library').where({
            USER_ID: DTO.USER_ID,
            GAME_NAME: DTO.GAME_NAME
        })
    } catch (e) {
        console.error('error: ', e);
        return [];
    }
    return response;
}

const getGameJoinedDate = async function (DTO, knex) {
    let response;
    try {
        response = await knex.select("JOINED_DATE").from('library').where({
            USER_ID: DTO.USER_ID,
            GAME_NAME: DTO.GAME_NAME
        })
    } catch (e) {
        console.error('error: ', e);
        return [];
    }
    return response;
}

const formatDate = function(dateToFormat) {
    const date = new Date(parseInt(dateToFormat));
    const formattedDate = [
        date.getFullYear(),
        date.getMonth().toString().length < 2 ? `0${date.getMonth() + 1}` : date.getMonth(),
        date.getDate().toString().length < 2 ? `0${date.getDate()}` : date.getDate()
    ];
    return formattedDate.join('-');
}

const getWastedTime = async function (DTO, knex) {
    let response;
    try {
        response = await knex.select("WASTED_TIME").from('library').where({
            USER_ID: DTO.USER_ID,
            GAME_NAME: DTO.GAME_NAME
        })
    } catch (e) {
        console.error('error: ', e);
        return [];
    }
    return response;
}

const getLastBan = async function (DTO, knex) {
    let response;
    const sqlQuery = `
    SELECT USER_ID, DATE, DURATION, REASON  
    FROM suspended 
    WHERE LIBRARY_ID = (
        SELECT LIBRARY_ID 
        FROM library 
        WHERE USER_ID = ${DTO.USER_ID} 
        AND GAME_NAME = '${DTO.GAME_NAME}'
    )
    ORDER BY SUSPENDED_ID DESC
    LIMIT 1
    `;

    try {
        response = await knex.raw(sqlQuery);
    } catch (e) {
        console.error('error: ', e);
        return [];
    }
    console.log(response);
    return response;
}

const getAllBans = async function (DTO, knex) {
    let response;
    const sqlQuery = `
    SELECT USER_ID, DATE, DURATION, REASON  
    FROM suspended 
    WHERE LIBRARY_ID = (
        SELECT LIBRARY_ID 
        FROM library 
        WHERE USER_ID = ${DTO.USER_ID} 
        AND GAME_NAME = '${DTO.GAME_NAME}'
    )
    ORDER BY SUSPENDED_ID DESC
    `;

    try {
        response = await knex.raw(sqlQuery);
    } catch (e) {
        console.error('error: ', e);
        return [];
    }
    console.log(response);
    return response;
}



module.exports.validateGameName = validateGameName;
module.exports.isNumberOfLengthN = isNumberOfLengthN;
module.exports.validateInsertUserBody = validateInsertUserBody;
module.exports.validateUsername = validateUsername;
module.exports.validateUserId = validateUserId;
module.exports.validateCardId = validateCardId;
module.exports.validateInsertCard = validateInsertCard;
module.exports.insertNewUser = insertNewUser;
module.exports.getUser = getUser;
module.exports.insertNewCard = insertNewCard;
module.exports.deleteCard = deleteCard;
module.exports.deleteCards = deleteCards;
module.exports.getCards = getCards;
module.exports.getCard = getCard;
module.exports.insertNewGame = insertNewGame;
module.exports.setStatus = setStatus;
module.exports.insertNewBan = insertNewBan;
module.exports.setWastedTime = setWastedTime;
module.exports.getStatus = getStatus;
module.exports.getGameJoinedDate = getGameJoinedDate;
module.exports.formatDate = formatDate;
module.exports.getWastedTime = getWastedTime;
module.exports.getLastBan = getLastBan;
module.exports.getAllBans = getAllBans;