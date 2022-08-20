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


