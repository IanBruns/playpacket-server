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
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, []);
            });
        });

        context('When there are rules in the database', () => {
            beforeEach('Seed tables in full', () => {
                return helpers.seedRules(db, testUsers, testGames, testRules);
            });

            it('Returns a 200 and the users rules only', () => {
                return helpers.makeExpectedRulesForUser(db, testUser)
                    .then(rules => {
                        const expectedRules = rules.map(rule => helpers.sanitizeRules(rule));

                        return supertest(app)
                            .get('/api/rules')
                            .set('Authorization', helpers.makeAuthHeader(testUser))
                            .expect(200, expectedRules);
                    });
            });
        });
    });

    describe.only(`POST /api/rules`, () => {
        beforeEach(`Seed in full`, () => {
            return helpers.seedRules(db, testUsers, testGames, testRules);
        });

        ['rule_description', 'game_id'].forEach(field => {
            const newRule = {
                rule_name: 'new rule name',
                rule_description: 'new rule description',
                game_id: 1
            };

            it(`Responds with a 400 when the ${field} is missing`, () => {
                delete newRule[field];

                return supertest(app)
                    .post(`/api/rules`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(newRule)
                    .expect(400, {
                        error: { message: `Missing ${field} in request body` }
                    });
            });
        });
    });
});