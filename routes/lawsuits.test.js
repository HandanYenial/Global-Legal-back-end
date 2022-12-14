"use strict";

const request = require("supertest"); 
const app = require("../app");

const{
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    testLawsuitIds,
    adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST/lawsuits" , function(){ //tests for the post/lawsuits route
    test("works:for admin" , async function(){ //test if the admin can create a lawsuit
        const response = await request(app)
                            .post(`/lawsuits`)
                            .send({
                                title : "Lawsuit1",
                                description : "Description1",
                                comment : "open",
                                location : "location1",
                                category_handle : "c1",
                                created_at: "2021-01-01",
                                updated_at: "2021-01-01",
                            })
                            .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(201); //expect the status code to be 201
        expect(response.body).toEqual({ //expect the response body to be
            lawsuit : {
                id : expect.any(Number),
                title : "Lawsuit1",
                description : "Description1",
                comment : "open",
                location : "location1",
                category_handle : "c1",
                created_at: "2021-01-01",
                updated_at: "2021-01-01",
            }
        });
    });

    test("unauth:for non-admin" , async function(){ //test if a non-admin can create a lawsuit
        const response = await request(app)
                            .post(`/lawsuits`)
                            .send({
                                title : "Lawsuit1",
                                description : "Description1",
                                comment : "open",
                                location : "location1",
                                category_handle : "c1",
                                created_at: "2021-01-01",
                                updated_at: "2021-01-01",
                            })
                            .set("authorization", `Bearer ${u1Token}`); //set the authorization header to the user token
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });


    test("bad request:with missing data" , async function(){ //test if the request is bad if the data is missing
        const response = await request(app)
                            .post(`/lawsuits`)
                            .send({
                                title : "Lawsuit1",
                                description : "Description1",
                            })
                            .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(400); //expect the status code to be 400
    });

    test("bad request:with invalid data" , async function(){ //test if the request is bad if the data is invalid
        const response = await request(app) 
                            .post(`/lawsuits`)
                            .send({
                                title : "Lawsuit1",
                                description : "Description1",
                                comment : "open",
                                location : 123456,
                                category_handle : "c1",
                                created_at: "2021-01-01",
                                updated_at: "2021-01-01",
                            })
                            .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(400); //expect the status code to be 400
    });
});

describe("GET" , function(){ //tests for the get route
    test("works:for admin" , async function(){
        const response = await request(app).get(`/lawsuits`)
                            .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.body).toEqual({ //expect the response body to be
            lawsuits : [
                {
                    id : expect.any(Number),
                    title : "Lawsuit1",
                    description : "Description1",
                    comment : "open",
                    location : "location1",
                    category_handle : "c1",
                    created_at : expect.any(String),
                    updated_at : expect.any(String),
                },
                {
                    id : expect.any(Number),
                    title : "Lawsuit2",
                    description : "Description2",
                    comment : "open",
                    location : "location2",
                    category_handle : "c2",
                    created_at: expect.any(String),
                    updated_at: expect.any(String),
                },
                {
                    id : expect.any(Number),
                    title : "Lawsuit3",
                    description : "Description3",
                    comment : "open",
                    location : "location3",
                    category_handle : "c3",
                    created_at: expect.any(String),
                    updated_at: expect.any(String),
                }
            ],
        });
    });

    test("works:for non-admin" , async function(){//test if a non-admin can get the lawsuits
        const response = await request(app).get(`/lawsuits`)
                            .set("authorization", `Bearer ${u1Token}`); //set the authorization header to the user token
        expect(response.body).toEqual({ //expect the response body to be
            lawsuits : [
                {
                    id : expect.any(Number),
                    title : "Lawsuit1",
                    description : "Description1",
                    comment : "open",
                    location : "location1",
                    category_handle : "c1",
                    created_at : expect.any(String),
                    updated_at : expect.any(String),
                },
                {
                    id : expect.any(Number),
                    title : "Lawsuit2",
                    description : "Description2",
                    comment : "open",
                    location : "location2",
                    category_handle : "c2",
                    created_at: expect.any(String),
                    updated_at: expect.any(String),
                },
                {
                    id : expect.any(Number),
                    title : "Lawsuit3",
                    description : "Description3",
                    comment : "open",
                    location : "location3",
                    category_handle : "c3",
                    created_at: expect.any(String),
                    updated_at: expect.any(String),
                },
            ],
        });
    });

    test("works:for admin with filter" , async function(){ //test if the admin can get the lawsuits with a filter
        const response = await request(app)
                            .get(`/lawsuits`)
                            .query({title : "Lawsuit1"})
                            .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.body).toEqual({ //expect the response body to be
            lawsuits : [
                {
                    id : expect.any(Number),
                    title : "Lawsuit1",
                    description : "Description1",
                    comment : "open",
                    location : "location1",
                    category_handle : "c1",
                    created_at : expect.any(String),
                    updated_at : expect.any(String),
                }
            ],
        });
    });

    test("works:for non-admin with filter" , async function(){ //test if a non-admin can get the lawsuits with a filter
        const response = await request(app)
                            .get(`/lawsuits`)
                            .query({title : "Lawsuit1"})
                            .set("authorization", `Bearer ${u1Token}`); //set the authorization header to the user token
        expect(response.body).toEqual({ //expect the response body to be
            lawsuits : [
                {
                    id : expect.any(Number),
                    title : "Lawsuit1",
                    description : "Description1",
                    comment : "open",
                    location : "location1",
                    category_handle : "c1",
                    created_at : expect.any(String),
                    updated_at : expect.any(String),
                }
            ],
        });
    });

    test("bad request:with invalid filter" , async function(){ //test if the request is bad if the filter is invalid
        const response = await request(app)
                            .get(`/lawsuits`)
                            .query({title : 123456})
                            .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(400); //expect the status code to be 400
    });
});

describe("GET/:id" , function(){ //tests for the get by id route
    test("works:for admin" , async function(){
        const response = await request(app).get(`/lawsuits/${testLawsuitIds[0]}`);
        expect(response.body).toEqual({ //expect the response body to be
            lawsuit : {
                id: testLawsuitIds[0],
                title : "Lawsuit1",
                description : "Description1",
                comment : "open",
                location : "location1",
                category_handle : "c1",
                created_at : expect.any(String),
                updated_at : expect.any(String),
            }
        });
    });

    test("works:for non-admin" , async function(){ //test if a non-admin can get the lawsuit by id
        const response = await request(app).get(`/lawsuits/${testLawsuitIds[0]}`)
                            .set("authorization", `Bearer ${u1Token}`); //set the authorization header to the user token
        expect(response.body).toEqual({ //expect the response body to be
            lawsuit : {
                id: testLawsuitIds[0],
                title : "Lawsuit1",
                description : "Description1",
                comment : "open",
                location : "location1",
                category_handle : "c1",
                created_at : expect.any(String),
                updated_at : expect.any(String),
            }
        });
    });

    test("not found for invalid id" , async function(){ //test if the request is not found if the id is invalid
        const response = await request(app).get(`/lawsuits/0`); 
        expect(response.statusCode).toEqual(404); //expect the status code to be 404
    });
});

describe("PATCH/lawsuits/:id" , function(){
    test("works: for admin" , async function(){
        const response = await request(app)
                            .patch(`/lawsuits/${testLawsuitIds[0]}`)
                            .send({
                                title : "NewLawsuit1",
                            })
                            .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.body).toEqual({ //expect the response body to be
            lawsuit : {
                id: testLawsuitIds[0],
                title : "NewLawsuit1",
                description : "Description1",
                comment : "open",
                location : "location1",
                category_handle : "c1",
                created_at : expect.any(String),
                updated_at : expect.any(String),
            },
        });
    });

    test("umauth for non-admin" , async function(){ //test if the request is unauthorized if the user is not an admin
        const response = await request(app)
                            .patch(`/lawsuits/${testLawsuitIds[0]}`)
                            .send({
                                title : "NewLawsuit1",
                            })
                            .set("authorization", `Bearer ${u1Token}`); //set the authorization header to the user token
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("not found for no such id" , async function(){ //test if the request is not found if the id is invalid
        const response = await request(app)
                            .patch(`/lawsuits/0`)
                            .send({
                                title : "NewLawsuit1",
                            })
                            .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(404); //expect the status code to be 404
    });

    test("bad request:with invalid data" , async function(){ //test if the request is bad if the data is invalid
        const response = await request(app)
                            .patch(`/lawsuits/${testLawsuitIds[0]}`)
                            .send({
                                title : 123456,
                            })
                            .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(400); //expect the status code to be 400
    });
});

describe("DELETE/lawsuits/:id" , function(){
    test("works: for admin" , async function(){
        const response = await request(app)
                            .delete(`/lawsuits/${testLawsuitIds[0]}`)
                            .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.body).toEqual(401); //expect the response body to be
    });

    test("unauth for non-admin" , async function(){ //test if the request is unauthorized if the user is not an admin
        const response = await request(app)
                            .delete(`/lawsuits/${testLawsuitIds[0]}`)
                            .set("authorization", `Bearer ${u1Token}`); //set the authorization header to the user token
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("not found for no such id" , async function(){ //test if the request is not found if the id is invalid
        const response = await request(app)
                            .delete(`/lawsuits/0`)
                            .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(404); //expect the status code to be 404
    });
});