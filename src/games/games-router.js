const express = require('express');
const { requireAuth } = require('../middleware/api-auth');
const GamesService = require('./games-service');

const gamesRouter = express.Router();

gamesRouter.route('/')
    .all(requireAuth)
    .get((req, res, next) => {

    })