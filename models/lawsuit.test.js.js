"use strict";

const { Lawsuit } = require("./lawsuit.js");
const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
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

describe("create", function(){
    let newLawsuit = {
        title:"New Lawsuit",
        description:"New Lawsuit Description",
        comment:"New Lawsuit",
        location:"New Lawsuit Location",
        departmentHandle:"d1",
        createdAt:"2021-01-01",
        updatedAt:"2021-01-01"
    };

    test("works" , async function(){
        let lawsuit = await Lawsuit.create(newLawsuit);
        expect(lawsuit).toEqual({
            id: expect.any(Number),
            title: "New Lawsuit",
            description: "New Lawsuit Description",
            comment: "New Lawsuit",
            location: "New Lawsuit Location",
            departmentHandle: "d1",
            createdAt: "2021-01-01",
            updatedAt: "2021-01-01"
        });
    });
});


describe("findAll", function(){
    test("works for all" , async function(){
        let lawsuits = await Lawsuit.findAll();
        expect(lawsuits).toEqual([
            {
                id: testLawsuitIds[0],
                title: "Lawsuit1",
                description: "Lawsuit1 Description",
                comment: "Lawsuit1",
                location: "Lawsuit1 Location",
                departmentHandle: "d1",
                createdAt: "2021-01-01",
                updatedAt: "2021-01-01"
            },
            {
                id: testLawsuitIds[1],
                title: "Lawsuit2",
                description: "Lawsuit2 Description",
                comment: "Lawsuit2",
                location: "Lawsuit2 Location",
                departmentHandle: "d2",
                createdAt: "2021-01-01",
                updatedAt: "2021-01-01"  
            },
            {
                id: testLawsuitIds[2],
                title: "Lawsuit3",
                description: "Lawsuit3 Description",
                comment: "Lawsuit3",
                location: "Lawsuit3 Location",
                departmentHandle: "d3",
                createdAt: "2021-01-01",
                updatedAt: "2021-01-01"
            },
        ]);
    });

    test("works by title search" , async function(){
        let lawsuits = await Lawsuit.findAll({title:"2"});
        expect(lawsuits).toEqual([
            {
                id: testLawsuitIds[1],
                title: "Lawsuit2",
                description: "Lawsuit2 Description",
                comment: "Lawsuit2",
                location: "Lawsuit2 Location",
                departmentHandle: "d2",
                createdAt: "2021-01-01",
                updatedAt: "2021-01-01"
            },
        ]);
    });
});

describe("get" ,function(){
    test("works", async function(){
        let lawsuit = await Lawsuit.get(testLawsuitIds[0]);
        expect(lawsuit).toEqual({
            id: testLawsuitIds[0],
            title: "Lawsuit1",
            description: "Lawsuit1 Description",
            comment: "Lawsuit1",
            location: "Lawsuit1 Location",
            department:{
                handle: "d1",
                name: "Department1",
                num_employees: 1,
                description: "Department1 Description",
            },
            createdAt: "2021-01-01",
            updatedAt: "2021-01-01"
        });
    });

    test("not found if no such lawsuit" , async function(){
        try{
            await Lawsuit.get(0);
            fail();
        } catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});


describe("update" , function(){
    let updateData = {
        title: "Updated Lawsuit",
        description: "Updated Lawsuit Description", 
        comment: "Updated Lawsuit",
        location: "Updated Lawsuit Location",  
        updated_at:"2021-01-01" 
    };

    test("works", async function(){
        let lawsuit = await Lawsuit.update(testLawsuitIds[0], updateData);
        expect(lawsuit).toEqual({
            id : testLawsuitIds[0],
            departmentHandle: "d1",
            ...updateData,
        });
    });

    test("not found if no such lawsuit" , async function(){
        try{
            await Lawsuit.update(0,{
                title: "Updated Lawsuit",
            });
            fail();
        } catch(err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data" , async function(){
        try{
            await Lawsuit.update(testLawsuitIds[0], {});
            fail();
        } catch {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

describe("remove", function(){
    test("works" , async function(){
        await Lawsuit.remove(testLawsuitIds[0]);
        const res = await db.query(
            "SELECT id FROM lawsuits WHERE id=$1", [testLawsuitIds[0]]
        );
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such lawsuit" , async function(){
        try{
            await Lawsuit.remove(0);
            fail();
        } catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
    
