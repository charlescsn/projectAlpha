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
        res.status(406).send({ msg: 'Invalid arguments11' });
        return;
    }
    
    let response = await tools.setStatus(newStatus, knex);

    res.send( response[0].changedRows ? 'updated': 'Error');
})


module.exports = router;