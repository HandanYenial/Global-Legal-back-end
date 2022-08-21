"use strict";

const db = require("../db");
const { createToken } = require("../helpers/tokens");
const Employee = require("../models/employee");
const Department = require("../models/department");
const Lawsuit = require("../models/lawsuit");

const testLawsuitIds = []; //Array to store lawsuit ids

async function commonBeforeAll(){
    await db.query("DELETE FROM employees"); //Delete all employees in the test database
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
                status:"status1",
                location:"location1",
                department_handle:"d1"
            }
        )).id;
    
    testLawsuitIds[1] = (
        await Lawsuit.create(
            {
                title:"Lawsuit2",
                description:"Lawsuit2 description",
                status:"status2",
                location:"location2",
                department_handle:"d2"
            }
        )).id;

    testLawsuitIds[2] = (
        await Lawsuit.create(
            {
                title:"Lawsuit3",
                description:"Lawsuit3 description",
                status:"status3",
                location:"location3",
                department_handle:"d3"
            }
        )).id;

    await Employee.register(
        {
            username:"employee1",
            password:"password1",
            firstname:"firstname1",
            lastname:"lastname1",
            email:"email@email.com",
            isAdmin:false
        }
    );
    await Employee.register(
        {
            username:"employee2",
            password:"password2",
            firstname:"firstname2",
            lastname:"lastname2",
            email:"employee2@email.com",
            isAdmin:false
        }
    );
    await Employee.register(
        {
            username:"employee3",
            password:"password3",
            firstname:"firstname3",
            lastname:"lastname3",
            email:"employee3@email.com",
            isAdmin:false
        }
    );

    await Employee.addLawsuit("employee1", testLawsuitIds[0]);
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

const e1Token = createToken({username:"employee1", isAdmin:false});
const e2Token = createToken({username:"employee2", isAdmin:false});
const adminToken = createToken({username:"employee3", isAdmin:true});

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testLawsuitIds,
    e1Token,
    e2Token,
    adminToken
};