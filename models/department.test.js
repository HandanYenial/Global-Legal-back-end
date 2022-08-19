"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("..expressError");
const { Department } = require("./department");
const { commonBeforeAll,
        commonBeforeEach,
        commonAfterEach,
        commonAfterAll,
        testLawsuitIds,} = require("./_testCommon");

beforeAll(commonBeforeAll); //run commonBeforeAll before each test case which is in _testCommon.js
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create" , function(){
    const newDepartment = {
        handle : "health",
        name : "Health",
        numEmployees : 25,
        description : "Health department",
    };

    test("works", async function(){
        let department = await Department.create(newDepartment);
        expect(department).toEqual(newDepartment);

        const result = await db.query(
            `SELECT handle,
                    name,
                    num_employees,
                    description
            FROM departments
            WHERE handle = 'new'`
        );
        expect(result.rows).toEqual([
            {
                handle : "health",  
                name : "Health",
                numEmployees : 25,
                description : "Health department",
            },
        ]);
    });

    test("bad request" , async function(){
        try{
            await Department.create(newDepartment);
            await Department.create(newDepartment);
            fail();
        } catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
        });
});

describe("findAll" , function(){
    test("works for all" , async function(){
        let departments = await Department.findAll();
        expect(departments).toEqual([
            {
                handle : "legal",
                name : "Legal",
                numEmployees : 25,
                description : "Legal department",
            },
            {
                handle : "health",
                name : "Health",
                numEmployees : 25,
                description : "Health department",
            },
            {
                handle : "hr",
                name : "HR",
                numEmployees : 25,
                description : "HR department",
            },
        ]);
    });

    test("works for filter by name" , async function(){
        let departments = await Department.findAll({name : "legal"});
        expect(departments).toEqual([
            {
                handle : "legal",
                name : "Legal",
                numEmployees : 25,
                description : "Legal department",
            },
        ]);
    });

    test("works for filter by name with no match" , async function(){
        let departments = await Department.findAll({name : "nope"});
        expect(departments).toEqual([]);
    });
});

describe("get" , function(){
    test("works" , async function(){
        let department = await Department.get("legal");
        expect(department).toEqual({
            handle : "legal",
            name : "Legal",
            numEmployees : 25,
            description : "Legal department",
            lawsuits :[
                {id: testLawsuitIds[0], title: "Lawsuit1", description: "Lawsuit1 description", status: "open", location: "New York", departmentHandle: "legal"},
                {id: testLawsuitIds[1], title: "Lawsuit2", description: "Lawsuit2 description", status: "open", location: "New York", departmentHandle: "legal"},
                {id: testLawsuitIds[2], title: "Lawsuit3", description: "Lawsuit3 description", status: "open", location: "New York", departmentHandle: "legal"},
            ],
        });
    });

    test("not found if no such department" , async function(){
        try{
            await Department.get("nope");
            fail();
        } catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});


describe("update" , function(){
    const updateData = {
        name : "Updated",
        numEmployees : 25,
        description : "Updated department",
    };

    test("works" , async function(){
        let department = await Department.update("legal, updateData");
        expect(department).toEqual({
            handle : "legal",
            ...updateData,
        });

        const result = await db.query(
            `SELECT handle,
                    name,
                    num_employees,
                    description
            FROM departments    
            WHERE handle = 'legal'`
        );
        expect(result.rows).toEqual([{
            handle : "legal",
            name: "Updated",
            numEmployees : 25,
            description : "Updated department",
        }]);
    });

    test("not found if there is no such department" , async function(){
        try{
            await Department.update("nope", updateData);
            fail();
        } catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
        });


    test("bad request with no data" , async function(){
        try{
            await Department.update("legal" , {});
            fail();
        } catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

describe("remove" , function(){
    test("works" , async function(){
        await Department.remove("legal");
        const res = await db.query(
            "SELECT handle FROM departments WHERE handle = 'legal'"
        );
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such department" , async function(){
        try{
            await Department.remove("nope");
            fail();
        } catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});




