const knex = require('knex');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Auth Endpoints', function () {
    let db;

    const { testUsers } = helpers.makePlayPacketFixtures();
    const testUser = testUsers[0];

    before('Make Knex Instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });
        app.set('db', db);
    });

    after('disconnect from the db', () => {
        return db.destroy();
    });

    before('cleanup', () => helpers.cleanTables(db));

    afterEach('cleanup', () => helpers.cleanTables(db));

    describe(`POST /api/auth/login`, () => {
        beforeEach('insert users', () => {
            return helpers.seedUsers(
                db, testUsers
            );
        });

        const requiredFields = ['user_name', 'password'];

        requiredFields.forEach(field => {
            const loginAttemptBody = {
                user_name: testUser.user_name,
                password: testUser.password,
            };

            it(`responds with 400 required error when '${field}' is missing`, () => {
                delete loginAttemptBody[field];

                return supertest(app)
                    .post('/api/auth/login')
                    .send(loginAttemptBody)
                    .expect(400, {
                        error: `Missing ${field} in request body`
                    });
            });
        });

        it(`responds 400 'invalid user name or password when bad user name`, () => {
            const invalidUser = { user_name: 'user-not', password: 'existy' };
            return supertest(app)
                .post('/api/auth/login')
                .send(invalidUser)
                .expect(400, { error: `Incorrect username or password` });
        });

        it(`responds 400 'invalid user name or password when password is invalid`, () => {
            const invalidPass = { user_name: testUser.user_name, password: 'nope' };

            return supertest(app)
                .post('/api/auth/login')
                .send(invalidPass)
                .expect(400, { error: `Incorrect username or password` });
        });

        it(`responds 200 and JWT auth token using secret when valid credentials`, () => {
            const userValidCreds = {
                user_name: testUser.user_name,
                password: testUser.password,
            };
            const expectedToken = jwt.sign(
                { user_id: testUser.id }, //payload
                process.env.JWT_SECRET,
                {
                    subject: testUser.user_name,
                    algorithm: 'HS256',
                }
            );
            return supertest(app)
                .post('/api/auth/login')
                .send(userValidCreds)
                .expect(200, {
                    authToken: expectedToken
                });
        });
    });
});