"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Category = require("./category.js");
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
    const newCategory = {
        handle : "new",
        name : "New",
        numEmployees : 25,
        description : "New category",
    };

    test("works", async function(){
        let category = await Category.create(newCategory);
        expect(category).toEqual(newCategory);

        const result = await db.query(
            `SELECT handle,
                    name,
                    num_employees,
                    description
            FROM categories
            WHERE handle = 'new'`
        );
        expect(result.rows).toEqual([
            {
                handle : "new",  
                name : "New",
                numEmployees : 25,
                description : "New category",
            },
        ]);
    });

    test("bad request" , async function(){
        try{
            await Category.create(newCategory);
            await Category.create(newCategory);
            fail();
        } catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

describe("findAll" , function(){
    test("works for all" , async function(){
        let categories = await Category.findAll();
        expect(categories).toEqual([
            {
                handle : "c1",
                name : "category 1",
                numEmployees : 25,
                description : "category 1 Description",
            },
            {
                handle : "c2",
                name : "category 2",
                numEmployees : 25,
                description : "category 2 Description",
            },
            {
                handle : "c3",
                name : "category 3",
                numEmployees : 25,
                description : "category 3 Description",
            },
        ]);
    });

    test("works for filter by name" , async function(){
        let categories = await Category.findAll({name : "category 1"});
        expect(categories).toEqual([
            {
                handle : "c1",
                name :"category 1",
                numEmployees : 25,
                description : "category 1 Description",
            },
        ]);
    });

    test("works for filter by name with no match" , async function(){
        let categories = await Category.findAll({name : "nope"});
        expect(categories).toEqual([]);
    });
});

describe("get" , function(){
    test("works" , async function(){
        let category = await Category.get("c1");
        expect(category).toEqual({
            handle : "c1",
            name : "category 1",
            numEmployees : 25,
            description : "category 1 Description",
            lawsuits :[
                {id: testLawsuitIds[0], title: "Lawsuit1", description: "Lawsuit1 description", comment: "open", location: "New York", categoryHandle: "c1"},
                {id: testLawsuitIds[1], title: "Lawsuit2", description: "Lawsuit2 description", comment: "open", location: "New York", categoryHandle: "c2"},
                {id: testLawsuitIds[2], title: "Lawsuit3", description: "Lawsuit3 description", comment: "open", location: "New York", categoryHandle: "c3"},
            ],
        });
    });

    test("not found if no such category" , async function(){
        try{
            await Category.get("nope");
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
        description : "Updated category",
    };

    test("works" , async function(){
        let category = await Category.update("c1, updateData");
        expect(category).toEqual({
            handle : "c1",
            ...updateData,
        });

        const result = await db.query(
            `SELECT handle,
                    name,
                    num_employees,
                    description
            FROM categories    
            WHERE handle = 'c1'`
        );
        expect(result.rows).toEqual([{
            handle : "c1",
            name: "Updated",
            numEmployees : 25,
            description : "Updated category",
        }]);
    });

    test("not found if there is no such category" , async function(){
        try{
            await Category.update("nope", updateData);
            fail();
        } catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
        });


    test("bad request with no data" , async function(){
        try{
            await Category.update("c1" , {});
            fail();
        } catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

describe("remove" , function(){
    test("works" , async function(){
        await Category.remove("c1");
        const res = await db.query(
            "SELECT handle FROM categories WHERE handle = 'c1'"
        );
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such category" , async function(){
        try{
            await Category.remove("nope");
            fail();
        } catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});




