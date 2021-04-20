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
    const card = {
        USER_ID: req.params.userId
    }

    let response = await tools.deleteCards(card, knex);
    res.send( response[0].affectedRows ? 'deleted': 'Error');
});

module.exports = router;