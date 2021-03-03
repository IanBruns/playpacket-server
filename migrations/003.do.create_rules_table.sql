CREATE TABLE rules (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE NOT NULL
    rule_title TEXT,
    rule_description TEXT NOT NULL,
    assigned_user INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL
);