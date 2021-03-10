const express = require('express');
const { requireAuth } = require('../middleware/api-auth');
const GamesService = require('./games-service');

const gamesRouter = express.Router();

gamesRouter.route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        GamesService.getUserGames(req.app.get('db'), req.user.id)
            .then(games => {
                return res.status(200).json(games);
            })
    })

module.exports = gamesRouter;