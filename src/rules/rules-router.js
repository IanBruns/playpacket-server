const express = require('express');
const path = require('path');
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

        for (const [key, value] of Object.entries(newRule)) {
            if (key !== rule_name && (value == null || value.length < 1))
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body` }
                });
        }

        newRule.assigned_user = req.user.id;
        newRule.game_id = parseInt(newRule.game_id);

        RulesService.addNewUserRule(req.app.get('db'), newRule)
            .then(rule => {
                return res.status(201)
                    .location(path.posix.join(req.originalUrl, `/${rule.id}`))
                    .json(RulesService.sanitizeUserRule(rule));
            });
    });

module.exports = rulesRouter;