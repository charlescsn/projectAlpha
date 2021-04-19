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
    console.log(response);
    res.send( response[0].affectedRows ? 'updated': 'Error');
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
})

router.post('/ban/:userId/:gameName', async (req,res) => {
    const { userId, gameName } = req.params;
    console.log('test : ', req.body.reason);
    reason = req.body.reason;

    const newBan = {
        REASON: `'${reason.replace(/\'/g, "\\'")}'`,
        DURATION: Number(req.body.duration)*1000*60*60*24,
        USER_ID: userId,
        DATE: Date.now(),
        GAME_NAME: `'${gameName}'`
    };

    console.log(newBan);

    if (!newBan.DURATION) {
        res.status(406).send({ msg: 'Invalid arguments' });
        return;
    }
    
    let response = await tools.insertNewBan(newBan, knex);

    res.send( response[0].affectedRows ? 'updated': 'Error');
})

module.exports = router;