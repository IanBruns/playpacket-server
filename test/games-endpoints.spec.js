const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('/api/games endpoints', () => {
    let db;

    const { testUsers, testGames, testRules } = helpers.makePlayPacketFixtures();
    const testUser = testUsers[0];


    before(`Make knex instance`, () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });

        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('cleanup', () => helpers.cleanTables(db));

    afterEach('cleanup', () => helpers.cleanTables(db));

    describe('GET /api/games', () => {
        context('When no games are rules are in the database', () => {
            beforeEach('Seed Users', () => helpers.seedUsers(db, testUsers));

            it('Returns a 200 and empty array', () => {
                return supertest(app)
                    .get('/api/games/')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, []);
            });
        });

        context('When then are rules in the database', () => {
            beforeEach('Seed in full', () => helpers.seedRules(db, testUsers, testGames, testRules));

            it('Returns a 200 and the tests users games', () => {
                const expectedGames = helpers.makeExpectedGames();

                return supertest(app)
                    .get('/api/games/')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, expectedGames);
            });
        });
    });

    describe('GET /api/games/all', () => {
        beforeEach('Seed in full', () => helpers.seedRules(db, testUsers, testGames, testRules));

        it('Pulls a 200 and all games', () => {
            return supertest(app)
                .get('/api/games/all')
                .expect(200, testGames);
        });
    });
});