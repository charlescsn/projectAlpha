const { Router } = require('express');
const knex = require('../../database');

const bcrypt = require('bcrypt');

const router = Router();
const tools = require('../../functions');

// Post recent activity

router.post('/activity/update/:userId', tools.validateUserId, tools.validateActivityBody, async (req, res) => {
    newActivity = {
        RECENT_ACTIVITY_DATE: `'${new Date(Date.now()).toString().slice(0, 33)}'`,
        RECENT_ACTIVITY_LOCATION: `'${req.body.location}'`,
        RECENT_ACTIVITY_DEVICE: `'${req.body.device}'`,
        USER_ID: req.params.userId
    };
    let response = await tools.updateRecentActivity(newActivity, knex);

    res.send( response[0].changedRows ? 'updated': 'Error');
})

router.post('/questions/update/:userId', tools.validateUserId, tools.validateQuestionsBody, async (req, res) => {
    newQuestions = {
        SECRET_QUESTION_1: `'${req.body.question1.replace(/\'/g, "\\'")}'`,
        SECRET_QUESTION_2: `'${req.body.question2.replace(/\'/g, "\\'")}'`,
        SECRET_ANSWER_1: `'${req.body.answer1.replace(/\'/g, "\\'")}'`,
        SECRET_ANSWER_2: `'${req.body.answer2.replace(/\'/g, "\\'")}'`,
        USER_ID: req.params.userId
    };
    let response = await tools.updateQuestions(newQuestions, knex);

    res.send( response[0].changedRows ? 'updated': 'Error');
})

router.post('/auth/update/:userId', tools.validateUserId, tools.validatePhoneNumber, async (req, res) => {
    newAuth = {
        AUTH: req.body.auth,
        USER_ID: req.params.userId,
        PHONENUMBER: req.body.phoneNumber
    };

    if (!tools.validateBool(newAuth.AUTH)) {
        res.status(406).send({ msg: 'Invalid arguments' });
        return;
    }

    let response = await tools.updateAuth(newAuth, knex);
    if (newAuth.AUTH) {
        res.send(response[0][0].changedRows && response[1][0].changedRows ? 'updated' : 'Error');
        return;
    }
    res.send(response[0].changedRows ? 'updated' : 'Error');

})

router.get('/activity/:userId', tools.validateUserId, async (req, res) => {
    let response;
    response = await tools.getActivity(req.params.userId, knex);
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
        data: response[0],
    });
})

router.get('/questions/:userId', tools.validateUserId, async (req, res) => {
    let response;
    response = await tools.getQuestions(req.params.userId, knex);
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
        data: response[0],
    });
})

router.get('/auth/:userId', tools.validateUserId, async (req, res) => {
    let response;
    response = await tools.getAuth(req.params.userId, knex);
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
        data: response[0],
    });
})

module.exports = router;