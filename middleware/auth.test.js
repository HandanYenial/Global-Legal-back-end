"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
    authenticateJWT,
    ensureLoggedIn,
    ensureAdmin,
    ensureCorrectEmployeeOrAdmin,
} = require("./auth");

const { SECRET_KEY } = require("../config");

const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

describe("authenticateJWT" , function(){
    test("works:via header" , function(){
        expect.assertions(2);
        //there are multiple ways to pass an autherization token, this is how to pass into header
        const req = { headers: { authorization: `Bearer ${testJwt}` } };
        const res = { locals: {} };
        const next = function(err){
            expect(err).toBeFalsy();
    };

    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
        employee: {
            iat: expect.any(Number),
            username: "test",
            isAdmin: false,
            },
        });
    });

    test("works: no header", function(){
        expect.assertions(2);
        const req = {};
        const res = { locals: {} };
        const next = function(err){
            expect(err).toBeFalsy();
        };

        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });

    test("works: invalid token", function(){
        expect.assertions(2);
        const req = { headers: { authorization: `Bearer ${badJwt}` } };
        const res = { locals: {} };
        const next = function(err){
            expect(err).toBeFalsy();
        };

        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });
});

describe("ensureLoggedIn", function(){
    test("works" , function(){
        expect.assertions(1); //expect 1 assertion to be made
        const req = {};
        const res = { locals: { employee: { username: "test", isAdmin: false } } };
        const next = function(err){
            expect(err).toBeFalsy();
        };
        ensureLoggedIn(req,res,next);
    });

    test("unauth if no login" , function(){
        expect.assertions(1);
        const req = {};
        const res = { locals : {}};
        const next = function(err){
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureLoggedIn(req,res,next);
    });
});

describe("ensureAdmin" , function(){
    test("works", function(){
        expect.assertions(1);
        const req = {};
        const res = { locals: { employee: {username:"test" , isAdmin: true} } };
        const next = function(err){
            expect(err).toBeFalsy();
        };
        ensureAdmin(req,res,next);
    });

    test("unauth if not admin", function(){
        expect.assertions(1);
        const req = {};
        const res = { local: { employee: { username: "test" , isAdmin : false } } };
        const next =  function(err){
            expect(err instanceof UnauthorizedError).toBeFalsy();
        };
        ensureAdmin(req,res,next);
    });

    test("unauth if anon" , function(){
        expect.assertions(1);
        const req = {};
        const res = { locals: {}}; //no employee
        const next = function(err){
            expect (err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureAdmin(req,res,next);
    });
});

describe("ensureCorrectEmployeeOrAdmin" , function(){
    test("works: admin" , function(){
        expect.assertions(1);
        const req = { params: { username : "test" } };
        const res = { locals : { employee : { username : "admin" , isAdmin : true } } };
        const next = function(err){
            expect(err).toBeFalsy();
        };
        ensureCorrectEmployeeOrAdmin(req,res,next);
    });

    test("works:same employee" , function(){
        expect.assertions(1);
        const req = { params : { username : "test" } };
        const res = { locals : { employee: { username:"test" , isAdmin : false } } };
        const next = function(err){
            expect(err).toBeFalsy();
        };
        ensureCorrectEmployeeOrAdmin(req,res,next);
    });

    test("unauth : mismatch" , function(){
        expect.assertions(1);
        const req = { params : { username : "wrong" } };
        const res = { locals : { employee : { username : "test" , isAdmin : false } } };
        const next = function(err){
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureCorrectEmployeeOrAdmin(req,res,next);
    });

    test("unauth : anon" , function(){
        expect.assertions(1);
        const req = { params : { username: "test"} };
        const res = { locals : {} };
        const next = function(err){
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureCorrectEmployeeOrAdmin(req,res,next);
    });
});
