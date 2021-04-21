const { Router } = require('express');
const knex = require('../../database');

const bcrypt = require('bcrypt');

const router = Router();
const tools = require('../../functions');


// Post recent activity

router.post('/activity/:userId', async (req, res) => {

})

module.exports = router;