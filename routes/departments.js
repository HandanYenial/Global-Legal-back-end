"use strict";

//Routes for departments in the lawfirm:
//as CriminalLaw, CivilLaw, etc.

const express = require("express");
const jsonschema = require("jsonschema");

const { BadRequestError } = require("../expressError");
const { ensureAdmin, ensureLoggedIn} = require("../middleware/auth");
const Department = require("../models/department");

const departmentNewSchema = require("../schemas/departmentNew.json");
const departmentUpdateSchema = require("../schemas/departmentUpdate.json");
const departmentSearchSchema = require("../schemas/departmentSearch.json");

const router = new express.Router();

/**POST 
 * { department } => { department }
 * department should be{handle, name, num_employees, description}
 * returns {handle, name, num_employees, description}
 * Authorization required: admin
 */

router.post("/" , ensureAdmin, async function(req,res,next){ //only admin can create a new department
    try{
        const validator = jsonschema.validate(req.body , departmentNewSchema); //we use jsonschema to validate the data
        if(!validator.valid){ //if the data is not valid(if the employee entered a number instead of a string for example)
            const errs = validator.errors.map(e => e.stack); //we map the errors to a new array
            throw new BadRequestError(errs); //and throw a new BadRequestError: 400 
        }
        const department = await Department.create(req.body); //if the data is valid, we create a new department(create is  a function in the Department model)
        return res.status(201).json({department}); //and return the new department with status 201: created
    } catch(err){
        return next(err);
    }
});


/**GET
 * { departments : [{handle, name, num_employees, description}, ...] }
 * Authorization required: employee
 * Search filter : handle
 */

router.get("/" ,ensureLoggedIn, async function(req,res,next){ //only logged in employees can see the departments
    try{
        const validator = jsonschema.validate(req.query, departmentSearchSchema); //we use jsonschema to validate the data
        if(!validator.valid){ //if the data is not valid(if the employee entered a number instead of a string for example)
            const errs = validator.errors.map(e =>e.stack); //we map the errors to a new array
            throw new BadRequestError(errs); //and throw a new BadRequestError: 400
        }
        const departments = await Department.findAll(req.query); //if the data is valid, we find all the departments(findAll is a function in the Department model)
        return res.json({departments}); //and return the departments
    } catch(err){
        return next(err);
    }
});


/**GET /[handle]
 * { department : {handle, name, num_employees, description, lawsuits} }
 * where lawsuits is[{id,title,description,comment,location,department_handle}]
 * Authorization required: employee
*/

router.get("/:handle" , ensureLoggedIn , async function(req,res,next){ //only logged in employees can see the department by searching for its handle
    try{
        const department = await Department.get(req.params.handle); //we get the department by its handle(get is a function in the Department model)
        return res.json({department}); //and return the department
    } catch(err){
        return next(err);
    }
});

/**PATCH
 * patch/ handle {field1, field2,...} =>{department}
 * fields can be name, num_employees, description(let's say there are 2 new paralegals in Criminal Law department)
 * returns {handle, name, num_employees, description}
 * Authorization required: admin
 */

router.patch("/:handle", ensureAdmin, async function(req,res,next){ //only admin can update a department
    try{
        const validator = jsonschema.validate(req.body, departmentUpdateSchema); //we use jsonschema to validate the data
        if(!validator.valid){ //if the data is not valid(if the employees entered a number instead of a string for example)
            const errs = validator.errors.map(e => e.stack); //we map the errors to a new array
            throw new BadRequestError(errs);
        }
        const department = await Department.update(req.params.handle , req.body); //if the data is valid, we update the department(update is a function in the Department model)
        return res.json({ department }); //and return the updated department
    } catch(err){
        return next(err);
    }
});

/**DELETE/handle
 * {deleted: handle}
 * Authorization required: admin
 */

router.delete("/:handle" , ensureAdmin, async function(req,res,next){ //only admin can delete a department
    try{
        await Department.remove(req.params.handle); //we remove the department by its handle(remove is a function in the Department model)
        return res.json({ deleted: req.params.handle }); //and return the handle of the deleted department
    } catch(err){
        return next(err);
    }
});


module.exports = router;