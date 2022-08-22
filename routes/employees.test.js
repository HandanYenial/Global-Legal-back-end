"use strict";

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

describe("PATCH/employees/:employee" , function(){//patch request to employees route with the username of employee1
    test("works for admin:admin can update employee info", async function(){
        const response = await request(app) //make a request to the app
                        .patch(`/employees/employee1`) //patch request to employees route with the username of employee1
                        .send({ //send the following data
                            firstname:"newfirstname1",
                            lastname:"newlastname1",
                        })
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.body).toEqual({ //expect the response body to be the following
            employee:{
                username:"employee1",
                firstname:"newfirstname1",
                lastname:"newlastname1",
                email:"employee1@email.com",
                isAdmin:false,
            },
        });
    });

    test("works for same employee:an employee can make changes on their own account", async function(){
        const response = await request(app) //make a request to the app
                        .patch(`/employees/employee1`) //patch request to employees route with the username of employee1
                        .send({ //send the following data
                            firstname:"newfirstname1",
                            lastname:"newlastname1",
                        })
                        .set("authorization", `Bearer ${e1Token}`); //set the authorization header to the employee token
        expect(response.body).toEqual({ //expect the response body to be the following
            employee:{
                username:"employee1",
                firstname:"newfirstname1",
                lastname:"newlastname1",
                email:"employee1@email.com",
                isAdmin:false,
            },
        });
    });

    test("unauth for other employees:employees cannot update another employee's info" , async function(){
        const response = await request(app) //make a request to the app
                        .patch(`/employees/employee1`) //patch request to employees route with the username of employee1
                        .send({ //send the following data
                            firstname:"newfirstname1",
                            lastname:"newlastname1",
                        })
                        .set("authorization", `Bearer ${e2Token}`); //set the authorization header to the employee token
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("unauth for anon" , async function(){
        const response = await request(app) //make a request to the app
                        .patch(`/employees/employee1`) //patch request to employees route with the username of employee1
                        .send({ //send the following data
                            firstname:"newfirstname1",
                            lastname:"newlastname1",
                        });
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("not found for no such employee" , async function(){
        const response = await request(app) //make a request to the app
                        .patch(`/employees/employee100`) //patch request to employees route with the username of employee100
                        .send({ //send the following data
                            firstname:"newfirstname1",
                            lastname:"newlastname1",
                        })
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(404); //expect the status code to be 404
    });

    test("bad request with invalid data" , async function(){
        const response = await request(app) //make a request to the app
                        .patch(`/employees/employee1`) //patch request to employees route with the username of employee1
                        .send({ //send the following data
                            firstname:42,
                            lastname:"newlastname1",
                        })
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(400); //expect the status code to be 400
    });


    test("works: can set new password", async function(){ //test to see if admin can change the password of an employee
        const response = await request(app) //make a request to the app
                        .patch(`/employees/employee1`) //patch request to employees route with the username of employee1
                        .send({ //send the following data
                            password:"newpassword",
                        })
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.body).toEqual({ //expect the response body to be the following
            employee:{
                username:"employee1",
                firstname:"newfirstname1",
                lastname:"newlastname1",
                email:"employee1@email.com",
                isAdmin:false,
            },
        });
    const isSuccessful = await Employee.authenticate("employee1", "newpassword"); //authenticate the employee with the new password
    expect(isSuccessful).toBeTruthy(); //expect the authentication to be successful
    });
});

describe("DELETE/employees/:employee" , function(){ //delete request to employees route with the username of employee1
    test("works for admin:admin can delete employee", async function(){
        const response = await request(app) //make a request to the app
                        .delete(`/employees/employee1`) //delete request to employees route with the username of employee1
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.body).toEqual({ deleted: "employee1" }); //expect the response body to be the following
    });

    test("works: employee can delete their own account", async function(){
        const response = await request(app) //make a request to the app
                        .delete(`/employees/employee2`) //delete request to employees route with the username of employee2
                        .set("authorization", `Bearer ${e2Token}`); //set the authorization header to the employee token
        expect(response.body).toEqual({ deleted: "employee2" }); //expect the response body to be the following
    });

    test("unauth for other employees:employees cannot delete another employee's account" , async function(){
        const response = await request(app) //make a request to the app
                        .delete(`/employees/employee1`) //delete request to employees route with the username of employee1
                        .set("authorization", `Bearer ${e2Token}`); //set the authorization header to the employee token
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("unauth for anon" , async function(){
        const response = await request(app) //make a request to the app
                        .delete(`/employees/employee1`) //delete request to employees route with the username of employee1
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("not found for no such employee" , async function(){
        const response = await request(app) //make a request to the app
                        .delete(`/employees/employee100`) //delete request to employees route with the username of employee100
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(404); //expect the status code to be 404
    });
});


describe("POST/employees/:username/lawsuits/:id", function(){
    test("works for admin:admin can assign a lawsuit to employee", async function(){
        const response = await request(app)//make a request to the app
                        .post(`/employees/employee1/lawsuits/${testLawsuitIds[1]}`) //post request to employees route with the username of employee1 and the id lawsuit
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.body).toEqual({ //expect the response body to be the following
            assigned:testLawsuitIds[1],
        });
    });

    test("works: employee can assign a lawsuit to themselves", async function(){
        const response = request(app) //make a request to the app
                        .post(`/employees/employee2/lawsuits/${testLawsuitIds[1]}`) //post request to employees route with the username of employee2 and the id lawsuit
                        .set("authorization", `Bearer ${e2Token}`); //set the authorization header to the employee token
        expect(response.body).toEqual({ //expect the response body to be the following
            assigned:testLawsuitIds[1]
        });
    });

    test("unauth for other employees:employees cannot assign a lawsuit to another employee" , async function(){
        const response = await request(app) //make a request to the app
                        .post(`/employees/employee1/lawsuits/${testLawsuitIds[1]}`) //post request to employees route with the username of employee1 and the id lawsuit
                        .set("authorization", `Bearer ${e2Token}`); //set the authorization header to the employee token
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("unauth for anon" , async function(){
        const response = await request(app) //make a request to the app
                        .post(`/employees/employee1/lawsuits/${testLawsuitIds[1]}`) //post request to employees route with the username of employee1 and the id lawsuit
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("not found for no such employee" , async function(){
        const response = await request(app) //make a request to the app
                        .post(`/employees/employee100/lawsuits/${testLawsuitIds[1]}`) //post request to employees route with the username of employee100 and the id lawsuit
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(404); //expect the status code to be 404
    });

    test("bad request for invalid lawsuit id" , async function(){
        const response = await request(app) //make a request to the app
                        .post(`/employees/employee1/lawsuits/invalid`) //post request to employees route with the username of employee1 and the id lawsuit
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(400); //expect the status code to be 400
    });
});
