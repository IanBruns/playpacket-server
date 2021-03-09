const express = require('express');
const path = require('path');
const RulesService = require('./rules-service');
const xss = require('xss');
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
        const { rule_title, rule_description, game_id } = req.body;
        const newRule = { rule_title, rule_description, game_id };

        for (const [key, value] of Object.entries(newRule)) {
            if (key != 'rule_title' && (value == null || value.length < 1))
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body` }
                });
        }

        newRule.assigned_user = req.user.id;
        newRule.game_id = parseInt(newRule.game_id);

        RulesService.addNewUserRule(req.app.get('db'), newRule, req.user.id)
            .then(rule => {
                return res.status(201)
                    .location(path.posix.join(req.originalUrl, `/${rule.id}`))
                    .json(RulesService.sanitizeUserRule(rule));
            })
            .catch(next);
    });

rulesRouter.route('/:rule_id')
    .all(requireAuth)
    .all(checkValidRule)
    .patch(jsonBodyParser, (req, res, next) => {
        const { rule_title, rule_description } = req.body;
        const fieldsToUpdate = { rule_title, rule_description };

        const numberOfValues = Object.values(fieldsToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: { message: 'Body must contain a the rule title or rule description' }
            })
        }

        fieldsToUpdate.rule_title = xss(fieldsToUpdate.rule_title);
        fieldsToUpdate.rule_description = xss(fieldsToUpdate.rule_description);

        RulesService.updateUserRule(
            req.app.get('db'),
            res.rule.id,
            fieldsToUpdate
        )
            .then(numRowsaffected => {
                return res.status(204).end();
            })
            .catch(next);
    })
    .delete((req, res, next) => {

    })

async function checkValidRule(req, res, next) {
    try {
        const rule = await RulesService.getById(
            req.app.get('db'),
            parseInt(req.params.rule_id),
            req.user.id
        );

        if (!rule) {
            return res.status(404).send({
                error: { message: `Rule does not exist` }
            })
        }

        res.rule = rule
        next();
    } catch (err) {
        next(err)
    }
}

module.exports = rulesRouter;