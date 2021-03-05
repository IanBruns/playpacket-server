const express = require('express');
const RulesService = require('./rules-service');

const rulesRouter = express.Router();
const jsonBodyParser = express.json();

rulesRouter
    .route('/')
    .get((req, res, next) => {
        return res.status(200).send('Hi, mom!');
    })

module.exports - rulesRouter;