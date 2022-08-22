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

// POST /departments
describe("POST/departments" , function(){
    const newDepartment = {
        handle: "new",
        name: "New",
        num_employees: 1,
        description: "New description",
    }

    test("admin can post" , async function(){
        const response = await request(app)
                .post("/departments")
                .send(newDepartment)
                .set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            department: newDepartment,
        });
    });

    test("unauth for non-admin" , async function(){
        const response = await request(app)
                .post("/departments")
                .send(newDepartment)
                .set("authorization", `Bearer ${u1Token}`);
        expect(response.statusCode).toEqual(401);
    });

    test("bad request with missing data" , async function(){
        const response = await request(app)
                .post("/departments")
                .send({
                    handle: "new",
                    numEmployees:10,
                })
                .set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(400);
    });

    test("bad request with invalid data" , async function(){
        const response = await request(app)
                .post("departments")
                .send({
                    ...newDepartment,
                    num_employees: "not-a-number",
                })
                .set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(400);
        });
}); 


describe("GET/departments", function(){
    test("ok for anon" , async function(){
        const response = await request(app).get("/departments");
        expect(response.body).toEqual({
            departments:[
                {
                    handle: "d1",
                    name: "Dept1",
                    numEmloyees:1,
                    description: "Desc1",
                },
                {
                    handle: "d2",
                    name: "Dept2",
                    numEmloyees:2,
                    description: "Desc2",
                },
                {
                    handle: "d3",
                    name: "Dept3",
                    numEmloyees:3,
                    description: "Desc3",
                },
            ],
        });
    });


    // test("filters by handle" , function(){
    //     const response = await request(app)
    //             .get("/departments")
    //             .query({handle:d1});
    //     expect(response.body).toEqual({
    //         departments:[
    //             {
    //                 handle: "d1",
    //                 name: "Dept1",
    //                 numEmloyees:1,
    //                 description: "Desc1",
    //             },
    //         ],
    //     });
    // });

    test("bad request if invalid filter key" , async function(){
        const response = await request(app)
                .get("/departments")
                .query({nope : "nope"});
        expect(response.statusCode).toEqual(400);
    });
});

describe("GET/departments/:handle" , function(){
    test("works for anon" , async function(){
        const response = await request(app).get(`/departments/d1`);
        expect(response.body).toEqual({
            department:{
                handle: "d1",
                name: "Dept1",
                numEmloyees:1,
                description: "Desc1",
                lawsuits:[
                    {id: testLawsuitIds[0], title: "L1", description: "Description1" , status: "status1" , location: "location1"},
                    {id: testLawsuitIds[1], title: "L2", description: "Description2" , status: "status2" , location: "location2"},
                    {id: testLawsuitIds[2], title: "L3", description: "Description3" , status: "status3" , location: "location3"},
                ],
            },
        });
    });

    test("works for anon: departments with or not lawsuits", async function(){
        const response = await request(app).get(`/departmens/d2`);
        expect(response.body).toEqual({
            department:{
                handle: "d2",
                name: "Dept2",
                numEmloyees:2,
                description: "Desc2",
                lawsuits:[],
            },
        });
    });

    test("not found for no such company" , async function(){
        const response = await request(app).get(`/departments/nope`);
        expect(response.statusCode).toEqual(404);
    });
});

describe("PATCH/departments/:handle" , function(){
    test("works for admin" , async function(){
        const response = await request(app)
                .patch(`/departments/d1`)
                .send({
                    name: "D1-New",
                })
                .set("authorization", `Bearer ${adminToken}`);
        expect(response.body).toEqual({
            department:{
                handle: "d1",
                name: "D1-New",
                numEmloyees:1,
                description: "Desc1",
            },
        });
    });


    test("unauth for non-admin", async function(){
        const response = await request(app)
                .patch(`/departments/d1`)
                .send({
                    name: "D1-new",
                })
                .set("authorization", `Bearer ${u1Token}`);
        expect(response.statusCode).toEqual(401);
    });

    test("unauth for anon", async function(){
        const response = await request(app)
                .patch(`/departments/d1`)
                .send({
                    name: "D1-new",
                });
        expect(response.statusCode).toEqual(401);
    });

    test("not found on no such department" , async function(){
        const response = await request(app)
                .patch(`/departments/nope`)
                .send({
                    name: "new-name",
                })
                .set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(404);
    });

    test("bas request on invalid data" , async function(){
        const response = await request(app)
                .patch(`/departments/d1`)
                .send({
                    name: 42,
                })
                .set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(400);
    });
});

describe("DELETE/departments/:handle" , function(){
    test("works for admin" , async function(){
        const response = await request(app)
                .delete(`departments/d1`)
                .set("authorization", `Bearer ${adminToken}`);
        expect(response.body).toEqual({ deleted :"d1"});
    });

    test("unauth for non-admin", async function(){
        const response = await request(app)
                .delete(`departments/d1`)
                .set("authorization", `Bearer ${u1Token}`);
        expect(response.statusCode).toEqual(401);
    });

    test("unauth for anon" , async function(){
        const response = await request(app)
                .delete(`departments/d1`);
        expect(response.statusCode).toEqual(401);
    });

    test("not found for no such department" , async function(){
        const response = await request(app)
                .delete(`departments/nope`)
                .set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(404);

    });
});