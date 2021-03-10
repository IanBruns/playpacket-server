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
    getUserRulesForGame(db, userId, gameId) {
        return db.select('*')
            .from('rules')
            .fullOuterJoin('games', 'games.id', 'rules.game_id')
            .where({ assigned_user: userId })
            .andWhere({ game_id: gameId });
    },
    getSearchRules(db, userId, game_id) {
        return db.select('*')
            .from('rules')
            .fullOuterJoin('games', 'games.id', 'rules.game_id')
            .where({ game_id })
            .whereNot({ assigned_user: userId });
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
    getGameById(db, game_id) {
        return db
            .select('*')
            .from('games')
            .where('games.id', game_id)
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
    },
    deleteRule(db, rule_id) {
        return db
            .from('rules')
            .where({ id: rule_id })
            .delete();
    },
    pullGameAssignedToUser(db, user_id, game_id) {
        return db
            .select('*')
            .from('usersgames')
            .where({ user_id })
            .andWhere({ game_id });
    },
    insertIntoUsersGames(items) {
        return db
            .insert(items)
            .into('usersgames')
            .returning('*');
    }
};

module.exports = RulesService;