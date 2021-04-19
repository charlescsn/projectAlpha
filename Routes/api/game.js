const { Router } = require('express');
const knex = require('../../database');

const router = Router();
const tools = require('../../functions');


router.post('/:userId/:gameName', tools.validateGameParams, async (req, res) => {
    const { userId, gameName } = req.params;

    const newGame = {
        USER_ID: userId,
        GAME_NAME: `'${gameName}'`,
        JOINED_DATE: Date.now()        
    }

    let response = await tools.insertNewGame(newGame, knex);
    res.send( response[0].affectedRows ? 'created': 'Error');
});

router.post('/update/:userId/:gameName', async (req,res) => {
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

router.post('/ban/:userId/:gameName', async (req,res) => {
    const { userId, gameName } = req.params;
    reason = req.body.reason;

    const newBan = {
        REASON: `'${reason.replace(/\'/g, "\\'")}'`,
        DURATION: Number(req.body.duration)*1000*60*60*24,
        USER_ID: userId,
        DATE: Date.now(),
        GAME_NAME: `'${gameName}'`
    };

    if (!newBan.DURATION) {
        res.status(406).send({ msg: 'Invalid arguments' });
        return;
    }
    
    let response = await tools.insertNewBan(newBan, knex);

    res.send( response[0].affectedRows ? 'created': 'Error');
});

router.post('/wastedTime/:userId/:gameName', tools.validateGameParams, async (req,res) => {
    const { userId, gameName } = req.params;
    const time = Number(req.body.time)

    const timeDTO = {
        WASTED_TIME: Number(req.body.time) * 1000 * 60,
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

router.get('/status/:userId/:gameName', (req, res) => {

})

module.exports = router;