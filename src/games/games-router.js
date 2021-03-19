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
            });
    });

gamesRouter.route('/all')
    .get((req, res, next) => {
        GamesService.getAllGames(req.app.get('db'))
            .then(games => {
                return res.status(200).json(games);
            });
    });

gamesRouter.route('/:game_id')
    .get((req, res, next) => {
        GamesService.getIndividualGame(req.app.get('db'), req.params.game_id)
            .then(game => {
                return res.status(200).json(game[0]);
            });
    });

module.exports = gamesRouter;