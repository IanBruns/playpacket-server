CREATE TABLE usersgames (
    user_id INTEGER REFERENCES users(id),
    game_id INTEGER REFERENCES games(id),
    PRIMARY KEY (user_id, game_id)
);