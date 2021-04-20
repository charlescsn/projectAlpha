const { Router } = require('express');
const knex = require('../../database');

const router = Router();
const tools = require('../../functions');


// Create card
router.post('/card/create/:userId', tools.validateInsertCard, async (req, res) => {
    const newCard = {
        USER_ID : req.params.userId,
        CARD: req.body.card,
        CVC: req.body.CVC
    }

    let response = await tools.insertNewCard(newCard, knex);
    res.send( response[0].affectedRows ? 'created': 'Error');
});

// Delete Card
router.post('/card/delete/:userId/:cardId', [tools.validateCardId, tools.validateUserId], async (req, res) => {
    const newCard = {
        USER_ID : req.params.userId,
        CARD_ID: req.params.cardId
    }

    let response = await tools.deleteCard(newCard, knex);
    res.send( response[0].affectedRows ? 'deleted': 'Error');
});

// Delete Cards
router.post('/cards/delete/:userId', tools.validateUserId, async (req, res) => {
    let response = await tools.deleteCards(req.params.userId, knex);
    
    res.send( response[0].affectedRows ? 'deleted': 'Error');
});

router.get('/cards/:userId', tools.validateUserId, async (req, res) => {
    const USER_ID = req.params.userId;

    const rep = await tools.getCards(USER_ID, knex);

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

router.get('/card/:userId/:cardId', [tools.validateCardId, tools.validateUserId], async (req, res) => {
    const card = {
        USER_ID: req.params.userId,
        CARD_ID: req.params.cardId
    }

    const rep = await tools.getCard(card, knex);
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
})

module.exports = router;