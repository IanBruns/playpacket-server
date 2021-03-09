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

    describe(`POST /api/rules`, () => {
        beforeEach(`Seed in full`, () => {
            return helpers.seedRules(db, testUsers, testGames, testRules);
        });

        ['rule_description', 'game_id'].forEach(field => {
            const newRule = {
                rule_title: 'new rule name',
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

        it('returns a 201 and pulls the item in a GET request', () => {
            const newRule = {
                rule_title: 'new rule name',
                rule_description: 'new rule description',
                game_id: 1
            };

            return supertest(app)
                .post('/api/rules')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(newRule)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body.rule_title).to.eql(newRule.rule_title);
                    expect(res.body.rule_description).to.eql(newRule.rule_description);
                    expect(res.body.game_id).to.eql(newRule.game_id);
                })
                .expect(res => {
                    return db.from('rules')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(row.rule_title).to.eql(newRule.rule_title);
                            expect(row.rule_description).to.eql(newRule.rule_description);
                            expect(row.game_id).to.eql(newRule.game_id);
                        });
                });
        });

        it(`Sanitizes an XSS attack`, () => {
            const { maliciousRule, expectedRule } = helpers.makeMaliciousRule();

            return supertest(app)
                .post('/api/rules')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(maliciousRule)
                .expect(201)
                .expect(res => {
                    expect(res.body.rule_title).to.eql(expectedRule.rule_title);
                    expect(res.body.rule_description).to.eql(expectedRule.rule_description);
                });
        });
    });

    describe('PATCH /api/rules/:rule_id', () => {
        context('Given no rules in the database', () => {
            beforeEach('Seed Users', () => helpers.seedUsers(db, testUsers));

            beforeEach('Seed Games', () => helpers.seedGames(db, testGames));

            it('Returns a 404 with rule not found', () => {
                const badId = 8675309;
                const badSend = {
                    rule_title: 'would be valid...IFFFFFF'
                };

                return supertest(app)
                    .patch(`/api/rules/${badId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(badSend)
                    .expect(404, {
                        error: { message: `Rule does not exist` }
                    });
            });
        });

        context(`Given Rules in the Database`, () => {
            beforeEach(`Seed in full`, () => helpers.seedRules(db, testUsers, testGames, testRules));

            it(`Returns a 404 with the rule not found`, () => {
                const badId = 8675309;
                const badSend = {
                    rule_title: 'would be valid...IFFFFFF'
                };

                return supertest(app)
                    .patch(`/api/rules/${badId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(badSend)
                    .expect(404, {
                        error: { message: `Rule does not exist` }
                    });
            });

            it('Rejects with 400 when nothing to update is sent', () => {
                const idToUpdate = 1;
                const badUpdate = {
                    best_musical_artist: 'Carly Rae Jepsen'
                };

                return supertest(app)
                    .patch(`/api/rules/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(badUpdate)
                    .expect(400, {
                        error: { message: 'Body must contain a the rule title or rule description' }
                    });
            });

            it(`Sends a 204 and updates the rule`, () => {
                const idToUpdate = 1;
                const ruleUpdate = {
                    rule_title: 'new rule title',
                    rule_description: 'new rule description'
                };

                return supertest(app)
                    .patch(`/api/rules/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(ruleUpdate)
                    .expect(204)
                    .expect(res => {
                        return db.from('rules')
                            .select('*')
                            .where({ id: idToUpdate })
                            .first()
                            .then(row => {
                                // console.log(row.rule_title);
                                // console.log(ruleUpdate.rule_title);
                                expect(row.rule_title).to.eql(ruleUpdate.rule_title);
                                expect(row.rule_description).to.eql(ruleUpdate.rule_description);
                            });
                    });
            });

            it('sends a 404 when trying to edit another players rule', () => {
                const updateId = 4;
                const validUpdate = {
                    rule_description: 'Hol up a minute'
                };

                return supertest(app)
                    .patch(`/api/rules/${updateId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(validUpdate)
                    .expect(404, {
                        error: { message: `Rule does not exist` }
                    });
            });
        });
    });

    describe('DELETE /api/rules/:rule_id', () => {
        beforeEach(`Seed in full`, () => helpers.seedRules(db, testUsers, testGames, testRules));

        it('sends a 404 when trying to delete another players rule', () => {
            const updateId = 4;

            return supertest(app)
                .delete(`/api/rules/${updateId}`)
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(404, {
                    error: { message: `Rule does not exist` }
                });
        });

        it('Sends a 204 and removes the exercises', () => {
            const idToDelete = 1;

            supertest(app)
                .delete(`/api/rules/${idToDelete}`)
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(204);
        });
    });
});