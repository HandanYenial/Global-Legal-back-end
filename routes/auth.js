"use strict"

/**Routes for authentication */

const jsonschema = require("jsonschema");

const Employee = require("../models/employee");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const employeeAuthSchema = require("../schemas/employeeAuth.json");
const employeeRegisterSchema = require("../schemas/employeeRegister.json");
const { BadRequestError } = require("../expressError");

/**POST/auth/token 
 * username,password ===> {token}
 * Return jwt token which can be used to authenticate further requests
 * Authorization required : none
 */

router.post("/token" , async function(req,res,next){
    try{
        const validator = jsonschema.validate(req.body, employeeAuthSchema);
        if (!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const { username, password } = req.body;
        const employee = await Employee.authenticate(username, password);
        const token = createToken(employee);
        return res.json({ token });
    } catch(err){
        return next(err);
    }
});

/**POST /auth/register
 * {employee} => {token}
 * employee should be {username, password, firstName, lastName, email}
 * Returns jwt token which can be used to authenticate further requests
 * Authorization required: none
 */

router.post("/register" , async function(req,res,next){
    try{
        const validator = jsonschema.validate(req.body, employeeRegisterSchema);
        if (!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const newEmployee = await Employee.register({...req.body,isAdmin:false});
        const token = createToken(newEmployee);
        return res.status(201).json({ token });
    } catch(err){
        return next(err);
    }
});


module.exports = router;
