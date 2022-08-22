const request = require('supertest');

const app = require('./app');
const db = require('./db');
const { commonAfterAll } = require('./routes/_testCommon');

test("not found for site 404" , async function(){
    const response = await request(app).get('/no-such-path');
    expect(response.statusCode).toBe(404);
});

test("not found for site 404" , async function(){
    process.env.NODE_ENV = "";
    const response = await request(app).get('/no-such-path');
    expect(response.statusCode).toBe(404);
    delete process.env.NODE_ENV;
});

afterAll(function(){
    db.end();
});
