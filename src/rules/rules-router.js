const express = require('express');
const RulesService = require('./rules-service');
const { requireAuth } = require('../middleware/api-auth');

const rulesRouter = express.Router();
const jsonBodyParser = express.json();

rulesRouter.route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        return res.status(200).send([]);
    })

module.exports = rulesRouter;