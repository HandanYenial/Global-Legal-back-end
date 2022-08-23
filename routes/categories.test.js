"use strict";

const request = require("supertest");

const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testLawsuitIds,
    u1Token,
    adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// POST /categories
describe("POST/categories" , function(){
    const newCategory = {
        handle: "new",
        name: "New",
        numEmployees: 1,
        description: "New description",
    }

    test("admin can post" , async function(){
        const response = await request(app)
                .post("/categories")
                .send(newCategory)
                .set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            category: newCategory,
        });
    });

    test("unauth for non-admin" , async function(){
        const response = await request(app)
                .post("/categories")
                .send(newCategory)
                .set("authorization", `Bearer ${u1Token}`);
        expect(response.statusCode).toEqual(401);
    });

    test("bad request with missing data" , async function(){
        const response = await request(app)
                .post("/categories")
                .send({
                    handle: "new",
                    numEmployees:10,
                })
                .set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(400);
    });

    test("bad request with invalid data" , async function(){
        const response = await request(app)
                .post("/categories")
                .send({
                    ...newCategory,
                    numEmployees: "not-a-number",
                })
                .set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(400);
        });
}); 


describe("GET/categories", function(){
    test("ok for anon" , async function(){
        const response = await request(app).get("/categories");
        expect(response.body).toEqual({
            categories:[
                {
                    handle: "c1",
                    name: "category1",
                    numEmloyees:1,
                    description: "Desc1",
                },
                {
                    handle: "c2",
                    name: "category2",
                    numEmloyees:2,
                    description: "Desc2",
                },
                {
                    handle: "c3",
                    name: "category3",
                    numEmloyees:3,
                    description: "Desc3",
                },
            ],
        });
    });


    test("filters by handle" , async function(){
        const response = await request(app)
                .get("/categories")
                .query({handle:c1});
        expect(response.body).toEqual({
            categories:[
                {
                    handle: "c1",
                    name: "category1",
                    numEmloyees:1,
                    description: "Desc1",
                },
            ],
        });
    });

    test("bad request if invalid filter key" , async function(){
        const response = await request(app)
                .get("/categories")
                .query({nope : "nope"});
        expect(response.statusCode).toEqual(400);
    });
});

describe("GET/categories/:handle" , function(){
    test("works for anon" , async function(){
        const response = await request(app).get(`/categories/c1`);
        expect(response.body).toEqual({
            category:{
                handle: "c1",
                name: "category1",
                numEmloyees:1,
                description: "Desc1",
                lawsuits:[
                    {id: testLawsuitIds[0], title: "L1", description: "Description1" , comment: "comment1" , location: "location1" , created_at: expect.any(String), updated_at: expect.any(String)},
                    {id: testLawsuitIds[1], title: "L2", description: "Description2" , comment: "comment2" , location: "location2" , created_at: expect.any(String), updated_at: expect.any(String)},
                    {id: testLawsuitIds[2], title: "L3", description: "Description3" , comment: "comment3" , location: "location3" , created_at: expect.any(String), updated_at: expect.any(String)},
                ],
            },
        });
    });

    test("works for anon:categories with or not lawsuits", async function(){
        const response = await request(app).get(`/categories/c2`);
        expect(response.body).toEqual({
            category:{
                handle: "c2",
                name: "category2",
                numEmloyees:2,
                description: "Desc2",
                lawsuits:[],
            },
        });
    });

    test("not found for no such category" , async function(){
        const response = await request(app).get(`/categories/nope`);
        expect(response.statusCode).toEqual(404);
    });
});

describe("PATCH/categories/:handle" , function(){
    test("works for admin" , async function(){
        const response = await request(app)
                .patch(`/categories/c1`)
                .send({
                    name: "C1-New",
                })
                .set("authorization", `Bearer ${adminToken}`);
        expect(response.body).toEqual({
            category:{
                handle: "c1",
                name: "C1-New",
                numEmloyees:1,
                description: "Desc1",
            },
        });
    });


    test("unauth for non-admin", async function(){
        const response = await request(app)
                .patch(`/categories/c1`)
                .send({
                    name: "C1-new",
                })
                .set("authorization", `Bearer ${u1Token}`);
        expect(response.statusCode).toEqual(401);
    });

    test("unauth for anon", async function(){
        const response = await request(app)
                .patch(`/categories/c1`)
                .send({
                    name: "C1-new",
                });
        expect(response.statusCode).toEqual(401);
    });

    test("not found on no such category" , async function(){
        const response = await request(app)
                .patch(`/categories/nope`)
                .send({
                    name: "new-name",
                })
                .set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(404);
    });

    test("bas request on invalid data" , async function(){
        const response = await request(app)
                .patch(`/categories/c1`)
                .send({
                    name: 42,
                })
                .set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(400);
    });
});

describe("DELETE/categories/:handle" , function(){
    test("works for admin" , async function(){
        const response = await request(app)
                .delete(`categories/c1`)
                .set("authorization", `Bearer ${adminToken}`);
        expect(response.body).toEqual({ deleted :"c1"});
    });

    test("unauth for non-admin", async function(){
        const response = await request(app)
                .delete(`categories/c1`)
                .set("authorization", `Bearer ${u1Token}`);
        expect(response.statusCode).toEqual(401);
    });

    test("unauth for anon" , async function(){
        const response = await request(app)
                .delete(`categories/c1`);
        expect(response.statusCode).toEqual(401);
    });

    test("not found for no such category" , async function(){
        const response = await request(app)
                .delete(`categories/nope`)
                .set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(404);

    });
});