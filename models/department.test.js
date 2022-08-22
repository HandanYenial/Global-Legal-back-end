"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Department = require("./department.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testLawsuitIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create" , function(){
    const newDepartment = {
        handle : "new",
        name : "New",
        numEmployees : 25,
        description : "New department",
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
                handle : "new",  
                name : "New",
                numEmployees : 25,
                description : "New department",
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
                handle : "d1",
                name : "Department 1",
                numEmployees : 25,
                description : "Department 1 Description",
            },
            {
                handle : "d2",
                name : "Department 2",
                numEmployees : 25,
                description : "Department 2 Description",
            },
            {
                handle : "d3",
                name : "Department 3",
                numEmployees : 25,
                description : "Department 3 Description",
            },
        ]);
    });

    test("works for filter by name" , async function(){
        let departments = await Department.findAll({name : "Department 1"});
        expect(departments).toEqual([
            {
                handle : "d1",
                name :"Department 1",
                numEmployees : 25,
                description : "Department 1 Description",
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
        let department = await Department.get("d1");
        expect(department).toEqual({
            handle : "d1",
            name : "Department 1",
            numEmployees : 25,
            description : "Department 1 Description",
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
        let department = await Department.update("d1, updateData");
        expect(department).toEqual({
            handle : "d1",
            ...updateData,
        });

        const result = await db.query(
            `SELECT handle,
                    name,
                    num_employees,
                    description
            FROM departments    
            WHERE handle = 'd1'`
        );
        expect(result.rows).toEqual([{
            handle : "d1",
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
            await Department.update("d1" , {});
            fail();
        } catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

describe("remove" , function(){
    test("works" , async function(){
        await Department.remove("d1");
        const res = await db.query(
            "SELECT handle FROM departments WHERE handle = 'd1'"
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




