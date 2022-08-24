"use strict"; 

const express = require("express");
const router = express.Router({mergeParams: true});//mergeParams: true is needed to access the id of the parent in the child(=lawsuit) route
const { BadRequest, BadRequestError } = require("../expressError");
const { ensureAdmin , ensureLoggedIn } = require("../middleware/auth");
const Lawsuit = require("../models/lawsuit");
const jsonschema = require("jsonschema");
const lawsuitNewSchema = require("../schemas/lawsuitNew.json");
const lawsuitUpdateSchema = require("../schemas/lawsuitUpdate.json");
const lawsuitSearchSchema = require("../schemas/lawsuitSearch.json");
const e = require("express");

/**POST /
 * lawsuit should be{title,description,comment,location,category_hanle}
 * Returns {lawsuit: {id, title, description, comment, location, category_handle}}
 * Authorization required: admin
 */

router.post("/" , ensureAdmin, async function(req,res,next){
    try{
        const validator = jsonschema.validate(req.body ,lawsuitNewSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e =>e.stack);
            throw new BadRequest(errs);
        }
    const lawsuit = await Lawsuit.create(req.body);
    return res.status(201).json({lawsuit});
    } catch(err){
        return next(err);
    }
});

/**GET /
 * Returns {lawsuits: [{id, title, description, comment, location, category_handle}, ...]}
 * Search filter: title
 * Authorization required: user or admin
 */

router.get("/" , ensureLoggedIn , async function(req,res,next){
    try{
        const validator = jsonschema.validate(req.query , lawsuitSearchSchema); //Validate the query according to the schema
        if(!validator.valid){ //If the query is not valid like if the query is not a string
            const errs = validator.errors.map(e =>e.stack); //Map the errors to the stack
            throw new BadRequestError(errs); //Throw a bad request error
        }
        const lawsuits = await Lawsuit.findAll(req.query); //Find all lawsuits according to the query(seacrh filter)
        return res.json({ lawsuits }); //Return the lawsuits
    } catch(err){
        return next(err);
    }
});

/** GET/id
 * Get a lawsuit details by id
 * Returns {lawsuit: {id, title, description, comment, location, category}}
 *    where category is {handle, name, num_employees,description}
 * Authorization required: user or admin
 */

router.get("/:id" , ensureLoggedIn , async function(req,res,next){
    try{
        const lawsuit = await Lawsuit.get(req.params.id); //Get the lawsuit by id where get is a static method in the lawsuit model
        return res.json({ lawsuit }); //Return the lawsuit
    } catch(err){
        return next(err);
    }
});

/**PATCH/:id
 * Update a lawsuit by id
 * Returns {lawsuit: {id, title, description, comment, location, category_handle}}
 * Authorization required: admin
 * Data can include: {title, description, comment, location, category_handle}
 */

router.patch("/:id" , ensureAdmin, async function(req,res,next){
    try{
        const validator = jsonschema.validate(req.body , lawsuitUpdateSchema); //Validate the body according to the schema
        if(!validator.valid){ //If the body is not valid like if the body is not a string
            const errs = validator.errors.map(e =>e.stack); //Map the errors to the stack
            throw new BadRequestError(errs); //Throw a bad request error
        }

        const lawsuit = await Lawsuit.update(req.params.id , req.body);
        return res.json({ lawsuit });
    } catch(err) {
        return next(err);
    }
});


/**DELETE/id
 * Delete a lawsuit by id
 * Returns {deleted : lawsuit }
 * Authorization required: admin
 */

router.delete("/:id", ensureAdmin , async function(req,res,next){
    try{
        await Lawsuit.remove(req.params.id); //Remove the lawsuit by id where remove is a static method in the lawsuit model
        return res.json({ deleted : req.params.id }); //Return the deleted id
    } catch(err){
        return next(err);
    }
});

module.exports = router;