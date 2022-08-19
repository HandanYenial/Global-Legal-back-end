"use strict";

const { Employee } = require("./employee");
const db = require("../db");
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
        const employee = await Employee.authenticate("e1" , "password1");
        expect(employee).toEqual({
            username: "e1",
            firstName: "Employee1",
            lastName: "Employee1",
            email: "employee1.employee.com",
            isAdmin: false,
        });
    });

    test("unauth if there is no such employee" , async function(){
        try{
            await Employee.authenticate("nope" , "password");
            fail();
        } catch(err){
            expect (err instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("unauth if the password is wrong", async function(){
        try{
            await Employee.authenticate("e1" , "wrong");
            fail();
        } catch(err){
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
});

describe ("register" ,function(){
    const newEmployee = {
        username: "new",
        firstName : "New",
        lastName: "Employee",
        email: "new.employee.com",
        isAdmin: false,
    };

    test("works", async function(){
        let employee = await Employee.register({...newEmployee, password: "password"});
        expect(employee).toEqual(newEmployee);
        const found = await db.query(
            "SELECT * FROM employees WHERE username = 'new'"
        );
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].is_admin).toEqual(false);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });


    test("adds admin" , async function(){
        let employee = await Employee.register({...newEmployee, password: "password", isAdmin: true});
        expect(employee).toEqual({...newEmployee, isAdmin: true});
        const found = await db.query(
            "SELECT * FROM employees WHERE username = 'new'"
        );
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].is_admin).toEqual(true);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("bad request with duplicated data" , async function(){
        try{
            await Employee.register({
                ...newEmployee,
                password: "password",
            });
            await Employee.register({
                ...newEmployee,
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
        let employees = await Employee.findAll();
        expect(employees).toEqual([
            {
                username: "e1",
                firstName: "Employee1",
                lastName: "Employee1",
                email: "employee1.employee.com",
                isAdmin: false,
            },
            {
                username: "e2",
                firstName: "Employee2",
                lastName: "Employee2",
                email: "employee2.employee.com",
                isAdmin: false,
            },
            {
                username: "e3",
                firstName: "Employee3",
                lastName: "Employee3",
                email: "employee3.employee.com",
                isAdmin: false,
            },
        ]);
    });
});

describe("get", function(){
    test("works", async function(){
        let employee = await Employee.get("e1");
        expect(employee).toEqual({
            username : "e1",
            firstName: "Employee1",
            lastName: "Employee1",
            email: "employee1.employee.com",
            isAdmin: false,
            assignments:[testLawsuitIds[0]],
        });
    });

    test("not found if no such employee", async function(){
        try{
            await Employee.get("nope");
            fail();
        } catch(err){
            expect (err instanceof NotFoundError).toBeTruthy();
        }
    });
});

describe("update", function(){
    const updatedData = {
        firstName: "Updated",
        lastName: "Employee",
        email: "updated.employee.com",
        isAdmin: true,
    };

    test("works", async function(){
        let lawsuit = await Employee.update("e1", updatedData);
        expect(lawsuit).toEqual({
            username: "e1",
            ...updatedData,
        });
    });

    test("works  :set password" , async function(){
        let job = await Employee.update("e1", {
            password: "new",
        });

        expect(job).toEqual({
            username: "e1",
            firstName: "Employee1",
            lastName: "Employee1",
            email: "employee1.employee.com",
            isAdmin: false,
        });

        const found = await db.query("SELECT * FROM employees WHERE username = 'e1'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("not found if there is no such user" , async function(){
        try{
            await Employee.update("nope", {
                firstName: "Updated",
            });
            fail();
        } catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data" , async function(){
        try{
            await Employee.update("e1", {});
            fail();
        } catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

describe("remove", function(){
    test("works", async function(){
        await Employee.remove("e1");
        const res = await db.query("SELECT username FROM employees WHERE username = 'e1'");
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such employee" , async function(){
        try{
            await Employee.remove("nope");
            fail();
        } catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

describe("assignToLawsuit" ,function(){
    test("works" , async function(){
        await Employee.assignToLawsuit("e1", testLawsuitIds[1]);
        const res = await db.query(
            "SELECT * FROM assignments WHERE lawsuit_id = $1", [testLawsuitIds[1]]
        );
        expect(res.rows).toEqual([{
            lawsuit_id : testLawsuitIds[1],
            username: "e1",
        }]);
    });

    test("not found if there is no such a job" , async function(){
        try{
            await Employee.assignToLawsuit("e1", 0);
            fail();
        } catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("not found if there is no such a employee" , async function(){
        try{
            await Employee.assignToLawsuit("nope", testLawsuitIds[0], "assigned");
            fail();
        } catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

