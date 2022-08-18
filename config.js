"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config(); 
require("colors"); 

const SECRET_KEY = process.env.SECRET_KEY || "real-secret"; //set the secret key 

const PORT = +process.env.PORT || 3001; //set the port 

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return (process.env.NODE_ENV === "test") 
      ? "postgresql://postgres:myPassword@localhost:5432/gl_test" //test database
      : process.env.DATABASE_URL || "postgresql://postgres:myPassword@localhost:5432/gl"; //dev database
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("Jobly Config:".green); 
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
