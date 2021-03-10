const config = require('../config');

const GamesService = {
    getUserGames(db, user_id) {
        return db.select('*')
            .from('usersgames')
            .innerJoin('games', 'usersgames.game_id', 'games.id')
            .where({ user_id });
    }
}
module.exports = GamesService;