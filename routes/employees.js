"use strict";

//Routes for employees

const express = require("express");
const router = express.Router();
const jsonschema = require("jsonschema");
const { BadRequestError } = require("../expressError");
const { ensureAdmin, ensureCorrectEmployeeOrAdmin} = require("../middleware/auth");
const Employee = require("../models/employee");
const employeeNewSchema = require("../schemas/employeeNew.json");
const employeeUpdateSchema = require("../schemas/employeeUpdate.json");

/**POST
 * Adds a new employee to the database. 
 * For admin to add new employees. 
 * Autherization required: admin
 * This returns newly created employee and an authentication token for the new employee.
 * Returns {employee: {username, firstName, lastName, email, isAdmin}, token}
 */

router.post("/" , ensureAdmin , async function(req,res,next){ //ensureAdmin:only admin can add new employees
    try{
        const validator = jsonschema.validate(req.body, employeeNewSchema); //validate the data by using jsonschema
        if(!validator.valid){ //if the data is not valid, throw an error
            const errs = validator.errors.map(e =>e.stack); //map the errors and return the error stack
            throw new BadRequestError(errs); //throw a bad request error with the error stack as the message
        }

        const employee = await Employee.create(req.body); //create a new employee, and return the employee
        const token = createToken(employee); //create a token for the employee and return the token
        return res.status(201).json({employee, token}); //return the employee and the token
    }catch(err) {
        return next(err);
    }
});

/**GET
 * {employees :[{username, firstName, lastName, email}, ...]}
 * Returns list of all employees.
 * Autharization requires: admin
 */

router.get("/" , ensureAdmin, async function(req,res,next){
    try{
        const employees = await Employee.findAll(); //find all employees and return them
        return res.json({employees}); //return the employees
    } catch (err){
        return next(err);
    }
});

/**GET/username 
 * Get information about a specific employee.
 * Returns {employee: {username, firstName, lastName, email, isAdmin, lawsuits}}
 * where lawsuit is{id, title,description, status,location,department_id}
 * Autherization required: admin or correct user
 */

router.get("/:username", ensureCorrectEmployeeOrAdmin, async function(){
    try{
        const employee = await Employee.get(req.params.username); //find the employee and return the employee
        return res.json({employee}); //return the employee
    }catch(err){
        return next(err);
    }
});

/**PATCH: 
 * Updates an employee's information. Data can include{firstName, lastName, email, password}
 * Autherization required: admin or correct user(same user as username)
 */

router.patch("/:username" , ensureCorrectEmployeeOrAdmin, async function(req,res,next){
    try{
        const validator = jsonschema.validate(req.body , employeeUpdateSchema); //validate the data by using jsonschema
        if(!validator.valid){
            const errs = validator.errors.map(e =>e.stack); //map the errors and return the error stack
            throw new BadRequestError(errs); //throw a bad request error with the error stack as the message
        }

        const employee = await Employee.update(req.params.username , req.body); //update the employee and return the employee
        return res.json({employee});
    } catch(err){
        return next(err);
    }

});

/**DELETE 
 * Deletes an employee from the database.
 * Autherization required: admin or correct user(same user as username)
 */

router.delete("/:username" , ensureCorrectEmployeeOrAdmin, async function(req,res,next){
    try{
        await Employee.remove(req.params.username); //delete the employee
        return res.json({ deleted: req.params.username }); //return the deleted employee message
    } catch(err){
        return next(err);
    }
});

/**POST/username/lawsuits/id 
 * Adds a lawsuit to an employee's list of lawsuits.
 * Authorization required: admin or correct user(same user as username)
 * Either admin can assign a lwasuit to the lawyer/paralegal or the lawyer/paralegal can choose a lawsuit to work on.
 */

router.post("/:username/:lawsuits/:id" , ensureCorrectEmployeeOrAdmin, async function(req,res,next){
    try{
        const lawsuitId = +req.params.id; //get the lawsuit id
        await Employee.addLawsuit(req.params.username, lawsuitId); //add the lawsuit to the employee's list of lawsuits
        return res.json({applied: lawsuitId}); //return the applied message
    } catch(err){
        return next(err);
    }
});

/**DELETE/username/lawsuits/id
 * Removes a lawsuit from an employee's list of lawsuits.
 * Authorization required: admin or correct user(same user as username)
 * admin can remove a lwasuit from the lawyer/paralegal 
 * Returns {deleted: lawsuitId}
*/

router.delete("/:username/:lawsuit/:id" , ensureAdmin, async function(req,res,next){
    try{
        const lawsuitId = +req.params.id; //get the lawsuit id
        await Employee.removeLawsuit(req.params.username, lawsuitId); //remove the lawsuit from the employee's list of lawsuits
        return res.json({deleted: lawsuitId}); //return the deleted message
    } catch(err){
        return next(err);
    }
});

module.exports = router; //export the routers