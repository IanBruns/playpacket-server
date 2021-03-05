CREATE TABLE usersgames (
    user_id INTEGER REFERENCES users(id) NOT NULL,
    games_id INTEGER REFERENCES games(id) NOT NULL,
    PRIMARY KEY (user_id, games_id)
);
