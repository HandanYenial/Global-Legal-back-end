"use strict";

const request = require("supertest"); //SuperTest is a library that allows you to test your Node. js HTTP servers. 
const db = require("../db.js"); //Import database
const app = require("../app");
const User = require("../models/user");

const{
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST/users" , function(){
    test("works for admin: admin can add a non-admin user" , async function(){ //test if admin can add an user
        const response = await request(app) //make a request to the app
                        .post("/users") //post to the users route
                        .send({ //send the following data
                            username:"user4",
                            password:"password4",
                            firstname:"firstname4",
                            lastname:"lastname4",
                            email:"user4@email.com",
                            isAdmin:false
                        })
                        .set("authorization" , `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(201); //expect the status code to be 201
        expect(response.body).toEqual({ //expect the response body to be the following(same as what we posted)
            user:{
                username:"user4",
                firstname:"firstname4",
                lastname:"lastname4",
                email:"user4@email.com",
                isAdmin:false
            }, token:expect.any(String),//expect the token to be any string
        });
    });

    test("works for admin: admin can add an admin user" , async function(){
        const response = await request(app) //make a request to the app
                        .post("/users") //post to the users route
                        .send({ //send the following data
                            username:"user5",
                            password:"password5",
                            firstname:"firstname5",
                            lastname:"lastname5",
                            email:"user5@email.com",
                            isAdmin:true
                        })
                        .set("authorization" , `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(201); //expect the status code to be 201
        expect(response.body).toEqual({ //expect the response body to be the following(same as what we posted)
            user:{
                username:"user5",
                firstname:"firstname5",
                lastname:"lastname5",
                email:"user5@email.com",
                isAdmin:true
            }, token:expect.any(String),//expect the token to be any string
        });
    });

    test("unauth for users:users cannot add an admin", async function(){
        const response = await request(app)
                        .post("/users") //post to the users route
                        .send({ //send the following data
                            username:"user6",
                            password:"password6",
                            firstname:"firstname6",
                            lastname:"lastname6",
                            email:"user6@email.com",
                            isAdmin:true
                        })
                        .set("authorization" , `Bearer ${u1Token}`); //set the authorization header to the user token
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("unauth for anon" , async function(){
        const response = await request(app)
                        .post("/users") //post to the users route
                        .send({ //send the following data
                            username:"user7",
                            password:"password7",
                            firstname:"firstname7",
                            lastname:"lastname7",
                            email:"user7@email.com",
                            isAdmin:true
                        });
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("bad request for missing data" , async function(){
        const response = await request(app)
                        .post("/users") //post to the users route
                        .send({ //send the following data
                            username:"user8"
                        })
                        .set("authorization" , `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(400); //expect the status code to be 400
    });

    test("bad request fro invalid data" , async function(){
        const response = await request(app)
                        .post("/users") //post to the users route
                        .send({ //send the following data
                            username:"user9",
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

describe("GET/users"  , function(){
    test("works for admin:admin can get list of users", async function(){
        const response = await request(app)
                        .get("/users") //get request to users route
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.body).toEqual({ //expect the response body to be the following
            users:[
                {
                    username:"user1",
                    firstname:"firstname1",
                    lastname:"lastname1",
                    email:"user1@email.com",
                    isAdmin:false
                },
                {
                    username:"user2",
                    firstname:"firstname2",
                    lastname:"lastname2",
                    email:"user2@email.com",
                    isAdmin:false
                },
                {
                    username:"user3",
                    firstname:"firstname3",
                    lastname:"lastname3",
                    email:"user3@email.com",
                    isAdmin:false
                },
            ],
        });
    });

    test("unauth for non-admin users" , async function(){
        const response = await request(app) //make a request to the app
                        .get("/users") //get request to users route
                        .set("authorization", `Bearer ${u1Token}`); //set the authorization header to the user token
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("unauth for anon" , async function(){
        const response = await request(app) //make a request to the app
                        .get("/users"); //get request to users route
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });
});


describe("GET/users/:username", function(){
    test("works for admin:admin can see user info", async function(){
        const response = await request(app) //make a request to the app
                        .get(`/users/user1`) //get request to users route with the username of user1
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.body).toEqual({ //expect the response body to be the following
            user:{
                username:"user1",
                firstname:"firstname1",
                lastname:"lastname1",
                email:"user1@email.com",
                isAdmin:false,
                assignments:[testLawsuitIds[0]],
            },
        });
    });

    test("works for user:user can see their own info", async function(){
        const response = request(app) //make a request to the app
                         .get(`/users/user1`) //get request to users route with the username of user1
                         .set("authorization", `Bearer ${u1Token}`); //set the authorization header to the user token
        expect(response.body).toEqual({ //expect the response body to be the following
            user:{
                username:"user1",
                firstname:"firstname1",
                lastname:"lastname1",
                email:"user1@emial.com",
                isAdmin:false,
                assignments:[testLawsuitIds[0]],
            },
        });
    });

    test("unauth for other users:users cannot see another user's info" , async function(){
        const response = await request(app) //make a request to the app
                        .get(`/users/user1`) //get request to users route with the username of user1
                        .set("authorization", `Bearer ${u2Token}`); //set the authorization header to the user token
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("unauth for anon" , async function(){
        const response = await request(app) //make a request to the app
                        .get(`/users/user1`); //get request to users route with the username of user1
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("not found for no such user" , async function(){
        const response = await request(app) //make a request to the app
                        .get(`/users/user100`) //get request to users route with the username of user100
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(404); //expect the status code to be 404
    });
});

describe("PATCH/users/:user" , function(){//patch request to users route with the username of user1
    test("works for admin:admin can update user info", async function(){
        const response = await request(app) //make a request to the app
                        .patch(`/users/user1`) //patch request to users route with the username of user1
                        .send({ //send the following data
                            firstname:"newfirstname1",
                            lastname:"newlastname1",
                        })
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.body).toEqual({ //expect the response body to be the following
            user:{
                username:"user1",
                firstname:"newfirstname1",
                lastname:"newlastname1",
                email:"user1@email.com",
                isAdmin:false,
            },
        });
    });

    test("works for same user:an user can make changes on their own account", async function(){
        const response = await request(app) //make a request to the app
                        .patch(`/users/user1`) //patch request to users route with the username of user1
                        .send({ //send the following data
                            firstname:"newfirstname1",
                            lastname:"newlastname1",
                        })
                        .set("authorization", `Bearer ${u1Token}`); //set the authorization header to the user token
        expect(response.body).toEqual({ //expect the response body to be the following
            user:{
                username:"user1",
                firstname:"newfirstname1",
                lastname:"newlastname1",
                email:"user1@email.com",
                isAdmin:false,
            },
        });
    });

    test("unauth for other users:users cannot update another user's info" , async function(){
        const response = await request(app) //make a request to the app
                        .patch(`/users/user1`) //patch request to users route with the username of user1
                        .send({ //send the following data
                            firstname:"newfirstname1",
                            lastname:"newlastname1",
                        })
                        .set("authorization", `Bearer ${u2Token}`); //set the authorization header to the user token
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("unauth for anon" , async function(){
        const response = await request(app) //make a request to the app
                        .patch(`/users/user1`) //patch request to users route with the username of user1
                        .send({ //send the following data
                            firstname:"newfirstname1",
                            lastname:"newlastname1",
                        });
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("not found for no such user" , async function(){
        const response = await request(app) //make a request to the app
                        .patch(`/users/user100`) //patch request to users route with the username of user100
                        .send({ //send the following data
                            firstname:"newfirstname1",
                            lastname:"newlastname1",
                        })
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(404); //expect the status code to be 404
    });

    test("bad request with invalid data" , async function(){
        const response = await request(app) //make a request to the app
                        .patch(`/users/user1`) //patch request to users route with the username of user1
                        .send({ //send the following data
                            firstname:42,
                            lastname:"newlastname1",
                        })
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(400); //expect the status code to be 400
    });


    test("works: can set new password", async function(){ //test to see if admin can change the password of an user
        const response = await request(app) //make a request to the app
                        .patch(`/users/user1`) //patch request to users route with the username of user1
                        .send({ //send the following data
                            password:"newpassword",
                        })
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.body).toEqual({ //expect the response body to be the following
            user:{
                username:"user1",
                firstname:"newfirstname1",
                lastname:"newlastname1",
                email:"user1@email.com",
                isAdmin:false,
            },
        });
    const isSuccessful = await User.authenticate("user1", "newpassword"); //authenticate the user with the new password
    expect(isSuccessful).toBeTruthy(); //expect the authentication to be successful
    });
});

describe("DELETE/users/:user" , function(){ //delete request to users route with the username of user1
    test("works for admin:admin can delete user", async function(){
        const response = await request(app) //make a request to the app
                        .delete(`/users/user1`) //delete request to users route with the username of user1
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.body).toEqual({ deleted: "user1" }); //expect the response body to be the following
    });

    test("works: user can delete their own account", async function(){
        const response = await request(app) //make a request to the app
                        .delete(`/users/user2`) //delete request to users route with the username of user2
                        .set("authorization", `Bearer ${u2Token}`); //set the authorization header to the user token
        expect(response.body).toEqual({ deleted: "user2" }); //expect the response body to be the following
    });

    test("unauth for other users:users cannot delete another user's account" , async function(){
        const response = await request(app) //make a request to the app
                        .delete(`/users/user1`) //delete request to users route with the username of user1
                        .set("authorization", `Bearer ${u2Token}`); //set the authorization header to the user token
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("unauth for anon" , async function(){
        const response = await request(app) //make a request to the app
                        .delete(`/users/user1`) //delete request to users route with the username of user1
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("not found for no such user" , async function(){
        const response = await request(app) //make a request to the app
                        .delete(`/users/user100`) //delete request to users route with the username of user100
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(404); //expect the status code to be 404
    });
});


describe("POST/users/:username/lawsuits/:id", function(){
    test("works for admin:admin can assign a lawsuit to user", async function(){
        const response = await request(app)//make a request to the app
                        .post(`/users/user1/lawsuits/${testLawsuitIds[1]}`) //post request to users route with the username of user1 and the id lawsuit
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.body).toEqual({ //expect the response body to be the following
            assigned:testLawsuitIds[1],
        });
    });

    test("works: user can assign a lawsuit to themselves", async function(){
        const response = request(app) //make a request to the app
                        .post(`/users/user2/lawsuits/${testLawsuitIds[2]}`) //post request to users route with the username of user2 and the id lawsuit
                        .set("authorization", `Bearer ${u2Token}`); //set the authorization header to the user token
        expect(response.body).toEqual({ //expect the response body to be the following
            assigned:testLawsuitIds[2]
        });
    });

    test("unauth for other users:users cannot assign a lawsuit to another user" , async function(){
        const response = await request(app) //make a request to the app
                        .post(`/users/user1/lawsuits/${testLawsuitIds[1]}`) //post request to users route with the username of user1 and the id lawsuit
                        .set("authorization", `Bearer ${u2Token}`); //set the authorization header to the user token
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("unauth for anon" , async function(){
        const response = await request(app) //make a request to the app
                        .post(`/users/user1/lawsuits/${testLawsuitIds[1]}`) //post request to users route with the username of user1 and the id lawsuit
        expect(response.statusCode).toEqual(401); //expect the status code to be 401
    });

    test("not found for no such user" , async function(){
        const response = await request(app) //make a request to the app
                        .post(`/users/user100/lawsuits/${testLawsuitIds[1]}`) //post request to users route with the username of user100 and the id lawsuit
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(404); //expect the status code to be 404
    });

    test("bad request for invalid lawsuit id" , async function(){
        const response = await request(app) //make a request to the app
                        .post(`/users/user1/lawsuits/invalid`) //post request to users route with the username of user1 and the id lawsuit
                        .set("authorization", `Bearer ${adminToken}`); //set the authorization header to the admin token
        expect(response.statusCode).toEqual(400); //expect the status code to be 400
    });
});
