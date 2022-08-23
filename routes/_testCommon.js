"use strict";

const db = require("../db");
const { createToken } = require("../helpers/tokens");
const User = require("../models/user");
const Department = require("../models/department");
const Lawsuit = require("../models/lawsuit");

const testLawsuitIds = []; //Array to store lawsuit ids

async function commonBeforeAll(){
    await db.query("DELETE FROM users"); //Delete all users in the test database
    await db.query("DELETE FROM departments"); //Delete all departments in the test database

    await Department.create(
        {
            handle: "d1",
            name: "Department 1",
            numEmployees: 15,
            description: "Department 1 description",
        }
    );

    await Department.create(
        {
            handle: "d2",
            name: "Department 2",
            numEmployees: 15,
            description: "Department 2 description",
        }
    );

    await Department.create(
        {
            handle: "d3",
            name: "Department 3",   
            numEmployees: 15,
            description: "Department 3 description",
        }
    );

    testLawsuitIds[0] = (
        await Lawsuit.create(
            {
                title:"Lawsuit1",
                description:"Lawsuit1 description",
                comment:"comment1",
                location:"location1",
                department_handle:"d1"
            }
        )).id;
    
    testLawsuitIds[1] = (
        await Lawsuit.create(
            {
                title:"Lawsuit2",
                description:"Lawsuit2 description",
                comment:"comment2",
                location:"location2",
                department_handle:"d2"
            }
        )).id;

    testLawsuitIds[2] = (
        await Lawsuit.create(
            {
                title:"Lawsuit3",
                description:"Lawsuit3 description",
                comment:"comment3",
                location:"location3",
                department_handle:"d3"
            }
        )).id;

    await User.register(
        {
            username:"user1",
            password:"password1",
            firstname:"firstname1",
            lastname:"lastname1",
            email:"user1@email.com",
            isAdmin:false
        }
    );
    await User.register(
        {
            username:"user2",
            password:"password2",
            firstname:"firstname2",
            lastname:"lastname2",
            email:"user2@email.com",
            isAdmin:false
        }
    );
    await User.register(
        {
            username:"user3",
            password:"password3",
            firstname:"firstname3",
            lastname:"lastname3",
            email:"user3@email.com",
            isAdmin:false
        }
    );

    await User.addLawsuit("user1", testLawsuitIds[0]);
}

async function commonBeforeEach(){
    await db.query("BEGIN");
}

async function commonAfterEach(){
    await db.query("ROLLBACK");
}

async function commonAfterAll(){
    await db.end();
}

const u1Token = createToken({username:"user1", isAdmin:false});
const u2Token = createToken({username:"user2", isAdmin:false});
const adminToken = createToken({username:"user3", isAdmin:true});

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testLawsuitIds,
    u1Token,
    u2Token,
    adminToken
};