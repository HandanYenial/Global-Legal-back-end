"use stirct";

const request = require("supertest"); //SuperTest is a library that allows you to test your Node. js HTTP servers. 
const db = require("../db.js"); //Import database
const app = require("../app");
const Employee = require("../models/employee");

const{
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    e1Token,
    e2Token,
    adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST/employees" , function(){
    test("works for admin: admin can add a non-admin employee" , async function(){ //test if admin can add an employee
        const response = await request(app) //make a request to the app
                        .post("/employees") //post to the employees route
                        .send({ //send the following data
                            username:"employee4",
                            password:"password4",
                            firstname:"firstname4",
                            lastname:"lastname4",
                            email:"employee4@email.com",
                            isAdmin:false
                        })
                        .set("authorization" , `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(201); //expect the status code to be 201
        expect(response.body).toEqual({ //expect the response body to be the following(same as what we posted)
            employee:{
                username:"employee4",
                firstname:"firstname4",
                lastname:"lastname4",
                email:"employee4@email.com",
                isAdmin:false
            }, token:expect.any(String),//expect the token to be any string
        });
    });

    test("works for admin: admin can add an admin employee" , async function(){
        const response = await request(app) //make a request to the app
                        .post("/employees") //post to the employees route
                        .send({ //send the following data
                            username:"employee5",
                            password:"password5",
                            firstname:"firstname5",
                            lastname:"lastname5",
                            email:"employee5@email.com",
                            isAdmin:true
                        })
                        .set("authorization" , `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(201); //expect the status code to be 201
        expect(response.body).toEqual({ //expect the response body to be the following(same as what we posted)
            employee:{
                username:"employee5",
                firstname:"firstname5",
                lastname:"lastname5",
                email:"employee5@email.com",
                isAdmin:true
            }, token:expect.any(String),//expect the token to be any string
        });
    });

    test("unauth for employees:employees cannot add an admin", async function(){
        const response = await request(app)
                        .post("/employees") //post to the employees route
                        .send({ //send the following data
                            username:"employee6",
                            password:"password6",
                            firstname:"firstname6",
                            lastname:"lastname6",
                            email:"employee6@email.com",
                            isAdmin:true
                        })
                        .set("authorization" , `Bearer ${e1Token}`); //set the authorization header to the employee token
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("unauth for anon" , async function(){
        const response = await request(app)
                        .post("/employees") //post to the employees route
                        .send({ //send the following data
                            username:"employee7",
                            password:"password7",
                            firstname:"firstname7",
                            lastname:"lastname7",
                            email:"employee7@email.com",
                            isAdmin:true
                        });
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("bad request for missing data" , async function(){
        const response = await request(app)
                        .post("/employees") //post to the employees route
                        .send({ //send the following data
                            username:"employee8"
                        })
                        .set("authorization" , `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(400); //expect the status code to be 400
    });

    test("bad request fro invalid data" , async function(){
        const response = await request(app)
                        .post("/employees") //post to the employees route
                        .send({ //send the following data
                            username:"employee9",
                            password:"password9",
                            firstname:"firstname9",
                            lastname:29,
                            email:"123456789",
                            isAdmin:true
                        })
                        .set("authorization" , `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(400); //expect the status code to be 400
    });
});

describe("GET/employees"  , function(){
    test("works for admin:admin can get list of employees", async function(){
        const response = await request(app)
                        .get("/employees") //get request to employees route
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.body).toEqual({ //expect the response body to be the following
            employees:[
                {
                    username:"employee1",
                    firstname:"firstname1",
                    lastname:"lastname1",
                    email:"employee1@email.com",
                    isAdmin:false
                },
                {
                    username:"employee2",
                    firstname:"firstname2",
                    lastname:"lastname2",
                    email:"employee2@email.com",
                    isAdmin:false
                },
                {
                    username:"employee3",
                    firstname:"firstname3",
                    lastname:"lastname3",
                    email:"employee3@email.com",
                    isAdmin:false
                },
            ],
        });
    });

    test("unauth for non-admin employees" , async function(){
        const response = await request(app) //make a request to the app
                        .get("/employees") //get request to employees route
                        .set("authorization", `Bearer ${e1Token}`); //set the authorization header to the employee token
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("unauth for anon" , async function(){
        const response = await request(app) //make a request to the app
                        .get("/employees"); //get request to employees route
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });
});


describe("GET/employees/:username", function(){
    test("works for admin:admin can see employee info", async function(){
        const response = await request(app) //make a request to the app
                        .get(`/employees/employee1`) //get request to employees route with the username of employee1
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.body).toEqual({ //expect the response body to be the following
            employee:{
                username:"employee1",
                firstname:"firstname1",
                lastname:"lastname1",
                email:"employee1@email.com",
                isAdmin:false,
                assignments:[testLawsuitIds[0]],
            },
        });
    });

    test("works for employee:employee can see their own info", async function(){
        const response = request(app) //make a request to the app
                         .get(`/employees/employee1`) //get request to employees route with the username of employee1
                         .set("authorization", `Bearer ${e1Token}`); //set the authorization header to the employee token
        expect(response.body).toEqual({ //expect the response body to be the following
            employee:{
                username:"employee1",
                firstname:"firstname1",
                lastname:"lastname1",
                email:"employee1@emial.com",
                isAdmin:false,
                assignments:[testLawsuitIds[0]],
            },
        });
    });

    test("unauth for other employees:employees cannot see another employee's info" , async function(){
        const response = await request(app) //make a request to the app
                        .get(`/employees/employee1`) //get request to employees route with the username of employee1
                        .set("authorization", `Bearer ${e2Token}`); //set the authorization header to the employee token
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("unauth for anon" , async function(){
        const response = await request(app) //make a request to the app
                        .get(`/employees/employee1`); //get request to employees route with the username of employee1
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("not found for no such employee" , async function(){
        const response = await request(app) //make a request to the app
                        .get(`/employees/employee100`) //get request to employees route with the username of employee100
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(404); //expect the status code to be 404
    });
});

