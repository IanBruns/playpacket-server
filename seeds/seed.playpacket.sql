BEGIN;

TRUNCATE
    usersgames,
    rules,
    games,
    users
    RESTART IDENTITY CASCADE;

INSERT INTO users (user_name, password)
VALUES
-- test_man, pass
('test_man', '$2a$16$6GFb.JN.2DQo0w/mc8.xuunyjWUrfVnTOjjSc5mReGA6Eb8LqK0iS'),
-- other_user, other_pass
('other_user', '$2a$16$.AfT/pDKGyGKcPHsv1Ac/uQXk5tuq/Hc8PPDtQKbMvL/cjN5BoGhW');

INSERT INTO games (game_name)
VALUES
('Uno'),
('Monopoly'),
('Mao'),
('Solitare'),
('Settlers of Catan'),
('Trouble'),
('Scrabble'),
('Risk'),
('Poker'),
('Pong'),
('Yahtzee');

INSERT INTO rules (game_id, rule_title, rule_description, assigned_user)
VALUES
(1, '+2', 'Draw 2 can be played on other draw 2 card, next player must draw 2xnumber of stacked draw 2s', 1),
(1, null, 'If anyone plays a 6, everyone must slap the deck. The last person to slap must take 2 cards', 1),
(1, 'Hot Swap', 'If a 0 is played, that person may swap hands with another player', 2),
(2, 'Free Parking', 'All money lost due to taxes or cards goes to free parking, player who lands on that space
takes the pot', 1),
(2, 'Double Go', 'A Player receives $400 for landing DIRECTLY ON Go.', 1),
(2, null, 'When in jail, a player cannot collect any rent money from other players.', 2);

INSERT INTO usersgames (user_id, game_id)
VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 2);

COMMIT;