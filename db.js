"use strict";

//Database setup for global&legal

const { Client } = require("pg"); //import the client from the pg module- A Client instance will use environment variables for all missing values.
const { getDatabaseUri } = require("./config"); //import the getDatabaseUri function from the config module

let db;

if (process.env.NODE_ENV === "production"){
    db = new Client({
        connectionString : getDatabaseUri(),
        ssl: {
            rejectUnauthorized: false
        }
    });
} else {
    db = new Client({
        connectionString : getDatabaseUri()
    });
}

db.connect();

module.exports = db; 