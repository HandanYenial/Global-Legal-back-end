"use strict";

const { Lawsuit } = require("./lawsuit");
const db = require("../db");
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
        status:"New Lawsuit Status",
        location:"New Lawsuit Location",
        departmentHandle:"d1",
    };

    test("works" , async function(){
        let lawsuit = await Lawsuit.create(newLawsuit);
        expect (lawsuit).toEqual({
            id: expect.any(Number),
            title: "New Lawsuit",
            description: "New Lawsuit Description",
            status: "New Lawsuit Status",
            location: "New Lawsuit Location",
            departmentHandle: "d1",
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
                status: "Lawsuit1 Status",
                location: "Lawsuit1 Location",
                departmentHandle: "d1",
                departmentName: "Department1",
            },
            {
                id: testLawsuitIds[1],
                title: "Lawsuit2",
                description: "Lawsuit2 Description",
                status: "Lawsuit2 Status",
                location: "Lawsuit2 Location",
                departmentHandle: "d2",
                departmentName: "Department2",
            },
            {
                id: testLawsuitIds[2],
                title: "Lawsuit3",
                description: "Lawsuit3 Description",
                status: "Lawsuit3 Status",
                location: "Lawsuit3 Location",
                departmentHandle: "d3",
                departmentName: "Department3",
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
                status: "Lawsuit2 Status",
                location: "Lawsuit2 Location",
                departmentHandle: "d2",
                departmentName: "Department2",
            },
        ]);
    });
});

describe("get" ,function(){
    test("works", async function(){
        let lawsuit = await Lawsuit.get(testLawsuitIds[0]);
        expect (lawsuit).toEqual({
            id: testLawsuitIds[0],
            title: "Lawsuit1",
            description: "Lawsuit1 Description",
            status: "Lawsuit1 Status",
            location: "Lawsuit1 Location",
            department:{
                handle: "d1",
                name: "Department1",
                num_employees: 1,
                description: "Department1 Description",
            }
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
        status: "Updated Lawsuit Status",
        location: "Updated Lawsuit Location",   
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
    
