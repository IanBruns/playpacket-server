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
    }
};

module.exports = RulesService;