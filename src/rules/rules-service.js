const config = require('../config');
const xss = require('xss');

const RulesService = {
    sanitizeUserRule(rule) {
        return {
            id: rule.id,
            game_id: rule.game_id,
            game_name: xss(rule.game_name),
            rule_title: xss(rule.rule_title),
            rule_description: xss(rule.rule_description),
            assigned_user: rule.assigned_user
        };
    },
    getUserRules(db, userId) {
        return db.select('*')
            .from('rules')
            .fullOuterJoin('games', 'games.id', 'rules.game_id')
            .where({ assigned_user: userId });
    },
    getById(db, rule_id, assigned_user_id) {
        return db
            .select('*')
            .from('rules')
            .fullOuterJoin('games', 'games.id', 'rules.game_id')
            .where('rules.id', rule_id)
            .andWhere('rules.assigned_user', assigned_user_id)
            .first();
    },
    addNewUserRule(db, newRule, assigned_user_id) {
        return db
            .insert(newRule)
            .into('rules')
            .returning('*')
            .then(([rule]) => rule)
            .then(rule => RulesService.getById(db, rule.id, assigned_user_id));
    },
    updateUserRule(db, rule_id, fieldsToUpdate) {
        return db
            .from('rules')
            .where({ id: rule_id })
            .update(fieldsToUpdate);
    }
};

module.exports = RulesService;