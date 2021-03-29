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
('other_user', '$2a$16$.AfT/pDKGyGKcPHsv1Ac/uQXk5tuq/Hc8PPDtQKbMvL/cjN5BoGhW');

INSERT INTO games (game_name)
VALUES
('Uno'),
('Monopoly'),
('Mao'),
('Settlers of Catan'),
('Risk'),
('Scrabble'),
('Pandemic'),
('Game of Life');

INSERT INTO rules (game_id, rule_title, rule_description, assigned_user)
VALUES
(1, '+2', 'Draw 2 can be played on other draw 2 card, next player must draw 2x number of stacked draw 2s', 1),
(1, null, 'If anyone plays a 6, everyone must slap the deck. The last person to slap must take 2 cards', 1),
(1, 'Hot Swap', 'If a 0 is played, that person may swap hands with another player', 2),
(2, 'Free Parking', 'All money lost due to taxes or cards goes to free parking, player who lands on that space takes the pot', 1),
(2, 'Double Go', 'A Player receives $400 for landing DIRECTLY ON Go.', 1),
(2, null, 'When in jail, a player cannot collect any rent money from other players.', 2),
-- Seeding extra rules to give app some flavor
(1, 'Zero Shuffle', 'Deck can never be shuffled for any reason.', 2),
(1, 'Color Blind 2s', '+2 cards can be stacks on top of any color, color changes to current +2 card', 2),
(2, 'Plane Ticket', 'If a play lands on Go they can forgo the money to instead land on any space of their choosing', 2),
(2, 'Supervision', 'A player can only build property on spaces they both own and land on', 2),
(3, 'Lemmy', 'When the Ace of Spades is played, player MUST yell out THE ACE OF SPADES or draw a card', 2),
(3, 'THAT guy', 'If one player calls out 3 rule violations in a row, that user must take a card for being a narc', 2),
(4, 'Cleaning up the Town', 'If the Robber is moved to a space where nobody is affected in any way, that player may take any card of their choosing', 2),
(4, 'Robin Hood', 'Robber Rule: If the user who moved the Robber has less victory points than the target, user steals 2 cards', 2),
(5, 'Down Under (The Sea)', 'Something bad happened and Australia is under the see.  Cover it up, you will not be using it', 2),
(5, 'Switzerland', 'Put a set amount of units on 4 random tiles, they are neutral and will defend their territory', 2),
(6, 'Are You Sure?', 'Your dictionary is a gamble now, if you play a word, a player can wager points against the validity of the word, now check the dictionary', 2),
(6, 'Golf Rules', 'The player with the lowest score wins', 2),
(7, 'Driving though a tunnel', 'Users can only speak when it is their turn', 2),
(8, 'Starting Over', 'If anything causes you to lose your job, you may instead lose all accumulated raises', 2),
(8, 'Dual Income, no kids', 'If you end the game without any children, add 35% to your final tally', 2);

INSERT INTO usersgames (user_id, game_id)
VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 2);

COMMIT;