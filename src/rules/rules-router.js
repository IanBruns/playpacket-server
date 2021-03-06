const express = require('express');
const RulesService = require('./rules-service');
const { requireAuth } = require('../middleware/api-auth');
const rulesRouter = express.Router();
const jsonBodyParser = express.json();

rulesRouter.route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        RulesService.getUserRules(req.app.get('db'), req.user.id)
            .then(rules => {
                return res.json(rules.map(RulesService.sanitizeUserRule));
            })
            .catch(next);
    })
    .post(jsonBodyParser, (req, res, next) => {
        const { rule_name, rule_description, game_id } = req.body;
        const newRule = { rule_name, rule_description, game_id };
    )}

module.exports = rulesRouter;