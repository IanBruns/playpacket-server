const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const xss = require('xss');

function makeUsersArray() {
    return [
        {
            id: 1,
            user_name: 'Test-user-1',
            password: 'password1',
        },
        {
            id: 2,
            user_name: 'Test-user-2',
            password: 'password2',
        },
        {
            id: 3,
            user_name: 'Test-user-3',
            password: 'password3',
        },
    ];
}

function makeGamesArray() {
    return [
        {
            id: 1,
            game_name: 'game 1'
        },
        {
            id: 2,
            game_name: 'game 2'
        },
        {
            id: 3,
            game_name: 'game 3'
        }
    ];
}

function makeRulesArray() {
    return [
        {
            id: 1,
            game_id: 1,
            rule_title: 'title 1',
            rule_description: 'description 1',
            assigned_user: 1
        },
        {
            id: 2,
            game_id: 1,
            rule_title: 'title 2',
            rule_description: 'description 2',
            assigned_user: 2
        },
        {
            id: 3,
            game_id: 2,
            rule_title: 'title 3',
            rule_description: 'description 3',
            assigned_user: 1
        },
        {
            id: 4,
            game_id: 3,
            rule_title: 'title 4',
            rule_description: 'description 4',
            assigned_user: 3
        },
        {
            id: 5,
            game_id: 3,
            rule_title: 'title 5',
            rule_description: 'description 5',
            assigned_user: 2
        },
        {
            id: 6,
            game_id: 1,
            rule_title: 'title 6',
            rule_description: 'description 6',
            assigned_user: 1
        },
    ]
}

function makeUsersGamesArray() {
    return [
        {
            id: 1,
            user_id: 1,
            game_id: 1
        },
        {
            id: 2,
            user_id: 1,
            game_id: 2
        },
        {
            id: 3,
            user_id: 2,
            game_id: 1
        },
        {
            id: 4,
            user_id: 3,
            game_id: 3
        },
    ];
}

function makeExpectedGames() {
    return [
        {
            id: 1,
            user_id: 1,
            game_id: 1,
            game_name: 'game 1'
        },
        {
            id: 2,
            user_id: 1,
            game_id: 2,
            game_name: 'game 2',
        },
    ]
}

function makeMaliciousRule() {
    const maliciousRule = {
        rule_title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        rule_description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        game_id: 1,
    };
    const expectedRule = {
        ...maliciousRule,
        rule_title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        rule_description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    };

    return {
        maliciousRule,
        expectedRule,
    }
}

function makePlayPacketFixtures() {
    const testUsers = makeUsersArray();
    const testGames = makeGamesArray();
    const testRules = makeRulesArray();

    return { testUsers, testGames, testRules };
}

function cleanTables(db) {
    return db.transaction(async trx =>
        await trx.raw(
            `TRUNCATE
            usersgames,
                rules,
                games,
                users
            `
        )
            .then(() =>
                Promise.all([
                    trx.raw(`ALTER SEQUENCE rules_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE games_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`SELECT setval('rules_id_seq', 0)`),
                    trx.raw(`SELECT setval('games_id_seq', 0)`),
                    trx.raw(`SELECT setval('users_id_seq', 0)`),
                ])
            )
    )
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 10)
    }))

    return db.into('users').insert(preppedUsers)
        .then(() =>
            db.raw(
                `SELECT setval('users_id_seq', ?)`,
                [users[users.length - 1].id],
            ));
}

function seedGames(db, games) {
    return db.into('games').insert(games)
        .then(() => {
            db.raw(
                `SELECT setval('games_id_seq', ?)`,
                [games[games.length - 1].id],
            );
        });
}

function seedUsersGames(db) {
    const usersGames = makeUsersGamesArray();

    return db.into('usersgames').insert(usersGames)
        .then(() => {
            db.raw(
                `SELECT setval('usersgames_id_seq', ?)`,
                [usersGames[usersGames.length - 1].id],
            );
        });
}

function seedRules(db, users, games, rules) {
    return db.transaction(async trx => {
        await seedUsers(trx, users);
        await seedGames(trx, games);
        await seedUsersGames(trx);
        await trx.into('rules').insert(rules)
        await trx.raw(
            `SELECT setval('rules_id_seq', ?)`,
            [rules[rules.length - 1].id],
        )
    })
}

function createTestExpectedRules() {
    return [
        {
            id: 1,
            game_id: 1,
            game_name: 'game 1',
            rule_title: 'title 1',
            rule_description: 'description 1',
            assigned_user: 1
        },
        {
            id: 2,
            game_id: 1,
            game_name: 'game 1',
            rule_title: 'title 2',
            rule_description: 'description 2',
            assigned_user: 2
        },
        {
            id: 3,
            game_id: 2,
            game_name: 'game 2',
            rule_title: 'title 3',
            rule_description: 'description 3',
            assigned_user: 1
        },
        {
            id: 4,
            game_id: 3,
            game_name: 'game 3',
            rule_title: 'title 4',
            rule_description: 'description 4',
            assigned_user: 3
        },
        {
            id: 5,
            game_id: 3,
            game_name: 'game 3',
            rule_title: 'title 5',
            rule_description: 'description 5',
            assigned_user: 2
        },
        {
            id: 6,
            game_id: 1,
            game_name: 'game 1',
            rule_title: 'title 6',
            rule_description: 'description 6',
            assigned_user: 1
        },
    ]
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.user_name,
        algorithm: 'HS256'
    })

    return `Bearer ${token}`;
}

module.exports = {
    makePlayPacketFixtures,
    cleanTables,
    seedUsers,
    seedGames,
    seedRules,
    makeMaliciousRule,
    createTestExpectedRules,
    makeAuthHeader,
    makeExpectedGames
}