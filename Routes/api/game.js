const { Router } = require('express');
const knex = require('../../database');

const router = Router();
const tools = require('../../functions');


router.post('/:userId/:gameName', [tools.validateGameName, tools.validateUserId ], async (req, res) => {
    const { userId, gameName } = req.params;

    const newGame = {
        USER_ID: userId,
        GAME_NAME: `'${gameName}'`,
        JOINED_DATE: tools.formatDate(Date.now())        
    }

    let response = await tools.insertNewGame(newGame, knex);
    res.send( response[0].affectedRows ? 'created': 'Error');
});

router.post('/update/:userId/:gameName', tools.validateUserId, async (req,res) => {
    const { userId, gameName } = req.params;

    const newStatus = {
        STATUS: req.body.status,
        USER_ID: userId,
        GAME_NAME: `'${gameName}'`
    };

    if (newStatus.STATUS > 1) {
        res.status(406).send({ msg: 'Invalid arguments' });
        return;
    }
    
    let response = await tools.setStatus(newStatus, knex);

    res.send( response[0].changedRows ? 'updated': 'Error');
});

router.post('/ban/:userId/:gameName', tools.validateUserId, async (req,res) => {
    const { userId, gameName } = req.params;
    reason = req.body.reason;

    const newBan = {
        REASON: `'${reason.replace(/\'/g, "\\'")}'`,
        DURATION: Number(req.body.duration),
        USER_ID: userId,
        DATE: `'${tools.formatDate(Date.now())}'`,
        GAME_NAME: `'${gameName}'`
    };

    console.log(newBan);

    if (!newBan.DURATION) {
        res.status(406).send({ msg: 'Invalid arguments' });
        return;
    }
    
    let response = await tools.insertNewBan(newBan, knex);

    res.send( response[0].affectedRows ? 'created': 'Error');
});

router.post('/wastedTime/update/:userId/:gameName', [tools.validateGameName, tools.validateUserId ], async (req,res) => {
    const { userId, gameName } = req.params;
    const time = Number(req.body.time)

    const timeDTO = {
        WASTED_TIME: Number(req.body.time),
        USER_ID: userId,
        GAME_NAME: `'${gameName}'`,
    }

    if (!time) {
        res.status(406).send({ msg: 'Invalid arguments' });
        return;
    }
    
    let response = await tools.setWastedTime(timeDTO, knex);

    res.send( response[0].changedRows ? 'updated': 'Error');
});

router.get('/status/:userId/:gameName', [tools.validateGameName, tools.validateUserId ], async (req, res) => {
    const statusDTO = {
        USER_ID: req.params.userId,
        GAME_NAME: req.params.gameName
    }

    const rep = await tools.getStatus(statusDTO, knex);
    if (rep.length == 0) {
        res.status(404).json({
            statusCode: 404,
            message: "No data found :/",
        });
        return;
    }
    res.status(200).json({
        statusCode: 200,
        message: "Successful",
        data: rep,
    });
});

router.get('/joinedDate/:userId/:gameName', [tools.validateGameName, tools.validateUserId ], async (req, res) => {
    const joinedDateDTO = {
        USER_ID: req.params.userId,
        GAME_NAME: req.params.gameName
    }

    const response = await tools.getGameJoinedDate(joinedDateDTO, knex);
    if (response.length == 0) {
        res.status(404).json({
            statusCode: 404,
            message: "No data found :/",
        });
        return;
    }

    res.status(200).json({
        statusCode: 200,
        message: "Successful",
        data: response[0].JOINED_DATE,
    });
});

router.get('/wastedTime/:userId/:gameName', [tools.validateGameName, tools.validateUserId ], async (req, res) => {
    const wastedTimeDTO = {
        USER_ID: req.params.userId,
        GAME_NAME: req.params.gameName
    }

    const response = await tools.getWastedTime(wastedTimeDTO, knex);
    if (response.length == 0) {
        res.status(404).json({
            statusCode: 404,
            message: "No data found :/",
        });
        return;
    }

    res.status(200).json({
        statusCode: 200,
        message: "Successful",
        data: response,
    });
});

router.get('/ban/last/:userId/:gameName', [tools.validateGameName, tools.validateUserId ], async (req, res) => {
    const lastBanDTO = {
        USER_ID: req.params.userId,
        GAME_NAME: req.params.gameName
    }

    const response = await tools.getLastBan(lastBanDTO, knex);
    if (response[0].length == 0) {
        res.status(404).json({
            statusCode: 404,
            message: "No data found :/",
        });
        return;
    }

    res.status(200).json({
        statusCode: 200,
        message: "Successful",
        data: response[0],
    });
});

router.get('/ban/all/:userId/:gameName', [tools.validateGameName, tools.validateUserId ], async (req, res) => {
    const allBansDTO = {
        USER_ID: req.params.userId,
        GAME_NAME: req.params.gameName
    }

    const response = await tools.getAllBans(allBansDTO, knex);
    if (response[0].length == 0) {
        res.status(404).json({
            statusCode: 404,
            message: "No data found :/",
        });
        return;
    }

    res.status(200).json({
        statusCode: 200,
        message: "Successful",
        data: response[0],
    });
});

module.exports = router;