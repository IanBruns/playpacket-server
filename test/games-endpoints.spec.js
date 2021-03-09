const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('/api/games endpoints', () => {
    let db;

    const { testUsers, testGames, testRules } = helpers.makePlayPacketFixtures();
    const testExpectedRules = helpers.createTestExpectedRules();
    const testUser = testUsers[0];

    after('disconnect from db', () => db.destroy());

    before('cleanup', () => helpers.cleanTables(db));

    afterEach('cleanup', () => helpers.cleanTables(db));
});