"use strict";

const User = require("./user.js");
const db = require("../db.js");
const { BadRequestError, NotFoundError, UnauthorizedError} = require("../expressError");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testLawsuitIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll); //run commonBeforeAll function before all tests which is in _testCommon.js
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("authenticate" , function(){
    test("works", async function(){
        const user = await User.authenticate("u1" , "password1");
        expect(user).toEqual({
            username: "u1",
            firstName: "user1",
            lastName: "user1",
            email: "user1.user.com",
            isAdmin: false,
        });
    });

    test("unauth if there is no such user" , async function(){
        try{
            await User.authenticate("nope" , "password");
            fail();
        } catch(err){
            expect (err instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("unauth if the password is wrong", async function(){
        try{
            await User.authenticate("u1" , "wrong");
            fail();
        } catch(err){
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
});

describe ("register" ,function(){
    const newuser = {
        username: "new",
        firstName : "New",
        lastName: "user",
        email: "new.user.com",
        isAdmin: false,
    };

    test("works", async function(){
        let user = await User.register({...newuser, password: "password"});
        expect(user).toEqual(newuser);
        const found = await db.query(
            "SELECT * FROM users WHERE username = 'new'"
        );
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].is_admin).toEqual(false);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });


    test("adds admin" , async function(){
        let user = await User.register({...newuser, password: "password", isAdmin: true});
        expect(user).toEqual({...newuser, isAdmin: true});
        const found = await db.query(
            "SELECT * FROM users WHERE username = 'new'"
        );
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].is_admin).toEqual(true);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("bad request with duplicated data" , async function(){
        try{
            await User.register({
                ...newuser,
                password: "password",
            });
            await User.register({
                ...newuser,
                password: "password",
            });
            fail();
        } catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

describe("findAll" , function(){
    test("works" , async function(){
        let users = await User.findAll();
        expect(users).toEqual([
            {
                username: "u1",
                firstName: "user1",
                lastName: "user1",
                email: "user1.user.com",
                isAdmin: false,
            },
            {
                username: "u2",
                firstName: "user2",
                lastName: "user2",
                email: "user2.user.com",
                isAdmin: false,
            },
            {
                username: "u3",
                firstName: "user3",
                lastName: "user3",
                email: "user3.user.com",
                isAdmin: false,
            },
        ]);
    });
});

describe("get", function(){
    test("works", async function(){
        let user = await User.get("u1");
        expect(user).toEqual({
            username : "u1",
            firstName: "user1",
            lastName: "user1",
            email: "user1.user.com",
            isAdmin: false,
            assignments:[testLawsuitIds[0]],
        });
    });

    test("not found if no such user", async function(){
        try{
            await User.get("nope");
            fail();
        } catch(err){
            expect (err instanceof NotFoundError).toBeTruthy();
        }
    });
});

describe("update", function(){
    const updatedData = {
        firstName: "Updated",
        lastName: "user",
        email: "updated.user.com",
        isAdmin: true,
    };

    test("works", async function(){
        let lawsuit = await User.update("u1", updatedData);
        expect(lawsuit).toEqual({
            username: "u1",
            ...updatedData,
        });
    });

    test("works:set password" , async function(){
        let lawsuit = await User.update("u1", {
            password: "new",
        });

        expect(lawsuit).toEqual({
            username: "u1",
            firstName: "user1",
            lastName: "user1",
            email: "user1.user.com",
            isAdmin: false,
        });

        const found = await db.query("SELECT * FROM users WHERE username = 'u1'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("not found if there is no such user" , async function(){
        try{
            await User.update("nope", {
                firstName: "Updated",
            });
            fail();
        } catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data" , async function(){
        try{
            await User.update("u1", {});
            fail();
        } catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

describe("remove", function(){
    test("works", async function(){
        await User.remove("u1");
        const res = await db.query("SELECT username FROM users WHERE username = 'u1'");
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such user" , async function(){
        try{
            await User.remove("nope");
            fail();
        } catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

describe("addLawsuit" ,function(){
    test("works" , async function(){
        await User.addLawsuit("u1", testLawsuitIds[1]);
        const res = await db.query(
            "SELECT * FROM assignments WHERE lawsuit_id = $1", [testLawsuitIds[1]]
        );
        expect(res.rows).toEqual([{
            lawsuit_id : testLawsuitIds[1],
            username: "u1",
        }]);
    });

    test("not found if there is no such a lawsuit" , async function(){
        try{
            await User.addLawsuit("u1", 0);
            fail();
        } catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("not found if there is no such a user" , async function(){
        try{
            await User.addLawsuit("nope", testLawsuitIds[0], "assigned");
            fail();
        } catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

