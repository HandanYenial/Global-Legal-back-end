"use strict";

const db = require("../db");
const { createToken } = require("../helpers/tokens");
const User = require("../models/user");
const Category = require("../models/category");
const Lawsuit = require("../models/lawsuit");

const testLawsuitIds = []; //Array to store lawsuit ids

async function commonBeforeAll(){
    await db.query("DELETE FROM users"); //Delete all users in the test database
    await db.query("DELETE FROM categories"); //Delete all categories in the test database

    await Category.create(
        {
            handle: "c1",
            name: "Category 1",
            numEmployees: 15,
            description: "Category 1 description",
        }
    );

    await Category.create(
        {
            handle: "c2",
            name: "Category 2",
            numEmployees: 15,
            description: "Category 2 description",
        }
    );

    await Category.create(
        {
            handle: "c3",
            name: "Category 3",   
            numEmployees: 15,
            description: "Category 3 description",
        }
    );

    testLawsuitIds[0] = (
        await Lawsuit.create(
            {
                title:"Lawsuit1",
                description:"Lawsuit1 description",
                comment:"comment1",
                location:"location1",
                category_handle:"c1",
            }
        )).id;
    
    testLawsuitIds[1] = (
        await Lawsuit.create(
            {
                title:"Lawsuit2",
                description:"Lawsuit2 description",
                comment:"comment2",
                location:"location2",
                category_handle:"c2",
            }
        )).id;

    testLawsuitIds[2] = (
        await Lawsuit.create(
            {
                title:"Lawsuit3",
                description:"Lawsuit3 description",
                comment:"comment3",
                location:"location3",
                category_handle:"c3",
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

    await User.addLawsuit("user1", testLawsuitIds[1]);
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