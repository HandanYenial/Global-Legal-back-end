"use strict";

//Routes for category in the lawfirm:
//as CriminalLaw, CivilLaw, etc.

const express = require("express");
const jsonschema = require("jsonschema");

const { BadRequestError } = require("../expressError");
const { ensureAdmin, ensureLoggedIn} = require("../middleware/auth");
const Category = require("../models/category");

const categoryNewSchema = require("../schemas/categoryNew.json");
const categoryUpdateSchema = require("../schemas/categoryUpdate.json");
const categorySearchSchema = require("../schemas/categorySearch.json");

const router = new express.Router();

/**POST 
 * { category } => { category }
 * category should be{handle, name, num_employees, description}
 * returns {handle, name, num_employees, description}
 * Authorization required: admin
 */

router.post("/" , ensureAdmin, async function(req,res,next){ //only admin can create a new category
    try{
        const validator = jsonschema.validate(req.body , categoryNewSchema); //we use jsonschema to validate the data
        if(!validator.valid){ //if the data is not valid(if the employee entered a number instead of a string for example)
            const errs = validator.errors.map(e => e.stack); //we map the errors to a new array
            throw new BadRequestError(errs); //and throw a new BadRequestError: 400 
        }
        const category = await Category.create(req.body); //if the data is valid, we create a new category(create is in the Category model)
        return res.status(201).json({category}); //and return the new category with status 201: created
    } catch(err){
        return next(err);
    }
});


/**GET
 * { categories : [{handle, name, num_employees, description}, ...] }
 * Authorization required: employee
 * Search filter : handle
 */

router.get("/" ,ensureLoggedIn, async function(req,res,next){ //only logged in employees can see the categories
    try{
        const validator = jsonschema.validate(req.query, categorySearchSchema); //we use jsonschema to validate the data
        if(!validator.valid){ //if the data is not valid(if the employee entered a number instead of a string for example)
            const errs = validator.errors.map(e =>e.stack); //we map the errors to a new array
            throw new BadRequestError(errs); //and throw a new BadRequestError: 400
        }
        const categories = await Category.findAll(req.query); //if the data is valid, we find all the categories(findAll is in the Category model)
        return res.json({categories}); //and return the categories
    } catch(err){
        return next(err);
    }
});


/**GET /[handle]
 * {category : {handle, name, num_employees, description, lawsuits} }
 * where lawsuits is[{id,title,description,comment,location,category_handle}]
 * Authorization required: employee
*/

router.get("/:handle" , ensureLoggedIn , async function(req,res,next){ //only logged in employees can see the categoryby searching for its handle
    try{
        const category = await Category.get(req.params.handle); //we get the category by its handle(get is in the category model)
        return res.json({category}); //and return the category
    } catch(err){
        return next(err);
    }
});

/**PATCH
 * patch/ handle {field1, field2,...} =>{category}
 * fields can be name, num_employees, description(let's say there are 2 new paralegals in Criminal Law category)
 * returns {handle, name, num_employees, description}
 * Authorization required: admin
 */

router.patch("/:handle", ensureAdmin, async function(req,res,next){ //only admin can update a category
    try{
        const validator = jsonschema.validate(req.body, categoryUpdateSchema); //we use jsonschema to validate the data
        if(!validator.valid){ //if the data is not valid(if the employees entered a number instead of a string for example)
            const errs = validator.errors.map(e => e.stack); //we map the errors to a new array
            throw new BadRequestError(errs);
        }
        const category = await Category.update(req.params.handle , req.body); //if the data is valid, we update the category(update is in the Category model)
        return res.json({ category }); //and return the updated category
    } catch(err){
        return next(err);
    }
});

/**DELETE/handle
 * {deleted: handle}
 * Authorization required: admin
 */

router.delete("/:handle" , ensureAdmin, async function(req,res,next){ //only admin can delete a category
    try{
        await Category.remove(req.params.handle); //we remove the categoryby its handle(remove is in the category model)
        return res.json({ deleted: req.params.handle }); //and return the handle of the deleted category
    } catch(err){
        return next(err);
    }
});


module.exports = router;