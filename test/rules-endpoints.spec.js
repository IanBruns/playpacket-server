const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only(`Reviews Enpoints`, function () {
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

    describe(`GET /api/rules`, () => {
        context('When there are no rules in the database', () => {
            beforeEach('seed with only users', () => {
                return helpers.seedUsers(db, testUsers);
            });

            it('returns a 200 and an empty array', () => {
                return supertest(app)
                    .get('/api/rules')
                    .set('Authorization', helpers.makeAuthHeader(testUsers))
                    .expect(200, []);
            });
        });
    });
})