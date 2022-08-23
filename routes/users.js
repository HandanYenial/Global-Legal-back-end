"use strict";

//Routes for users

const express = require("express");
const router = express.Router();
const jsonschema = require("jsonschema");
const { BadRequestError } = require("../expressError");
const { ensureAdmin, ensureCorrectUserOrAdmin} = require("../middleware/auth");
const User = require("../models/user");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

/**POST
 * Adds a new user to the database. 
 * For admin to add new users. 
 * Autherization required: admin
 * This returns newly created user and an authentication token for the new user.
 * Returns {user: {username, firstName, lastName, email, isAdmin}, token}
 */

router.post("/" , ensureAdmin , async function(req,res,next){ //ensureAdmin:only admin can add new users
    try{
        const validator = jsonschema.validate(req.body, userNewSchema); //validate the data by using jsonschema
        if(!validator.valid){ //if the data is not valid, throw an error
            const errs = validator.errors.map(e =>e.stack); //map the errors and return the error stack
            throw new BadRequestError(errs); //throw a bad request error with the error stack as the message
        }

        const user = await User.create(req.body); //create a new user, and return the user
        const token = createToken(user); //create a token for the user and return the token
        return res.status(201).json({user, token}); //return the user and the token
    }catch(err) {
        return next(err);
    }
});

/**GET
 * {users :[{username, firstName, lastName, email}, ...]}
 * Returns list of all users.
 * Autharization requires: admin
 */

router.get("/" , ensureAdmin, async function(req,res,next){
    try{
        const users = await User.findAll(); //find all users and return them
        return res.json({users}); //return the users
    } catch (err){
        return next(err);
    }
});

/**GET/username 
 * Get information about a specific user.
 * Returns {user: {username, firstName, lastName, email, isAdmin, lawsuits}}
 * where lawsuit is{id, title,description, comment,location,department_id}
 * Autherization required: admin or correct user
 */

router.get("/:username", ensureCorrectUserOrAdmin, async function(){
    try{
        const user = await User.get(req.params.username); //find the user and return the user
        return res.json({user}); //return the user
    }catch(err){
        return next(err);
    }
});

/**PATCH: 
 * Updates an user's information. Data can include{firstName, lastName, email, password}
 * Autherization required: admin or correct user(same user as username)
 */

router.patch("/:username" , ensureCorrectUserOrAdmin, async function(req,res,next){
    try{
        const validator = jsonschema.validate(req.body , userUpdateSchema); //validate the data by using jsonschema
        if(!validator.valid){
            const errs = validator.errors.map(e =>e.stack); //map the errors and return the error stack
            throw new BadRequestError(errs); //throw a bad request error with the error stack as the message
        }

        const user = await User.update(req.params.username , req.body); //update the user and return the user
        return res.json({user});
    } catch(err){
        return next(err);
    }

});

/**DELETE 
 * Deletes an user from the database.
 * Autherization required: admin or correct user(same user as username)
 */

router.delete("/:username" , ensureCorrectUserOrAdmin, async function(req,res,next){
    try{
        await User.remove(req.params.username); //delete the user
        return res.json({ deleted: req.params.username }); //return the deleted user message
    } catch(err){
        return next(err);
    }
});

/**POST/username/lawsuits/id 
 * Adds a lawsuit to an user's list of lawsuits.
 * Authorization required: admin or correct user(same user as username)
 * Either admin can assign a lwasuit to the lawyer/paralegal or the lawyer/paralegal can choose a lawsuit to work on.
 */

router.post("/:username/:lawsuits/:id" , ensureCorrectUserOrAdmin, async function(req,res,next){
    try{
        const lawsuitId = +req.params.id; //get the lawsuit id
        await User.addLawsuit(req.params.username, lawsuitId); //add the lawsuit to the user's list of lawsuits
        return res.json({applied: lawsuitId}); //return the applied message
    } catch(err){
        return next(err);
    }
});

/**DELETE/username/lawsuits/id
 * Removes a lawsuit from an user's list of lawsuits.
 * Authorization required: admin or correct user(same user as username)
 * admin can remove a lwasuit from the lawyer/paralegal 
 * Returns {deleted: lawsuitId}
*/

router.delete("/:username/:lawsuit/:id" , ensureAdmin, async function(req,res,next){
    try{
        const lawsuitId = +req.params.id; //get the lawsuit id
        await User.removeLawsuit(req.params.username, lawsuitId); //remove the lawsuit from the user's list of lawsuits
        return res.json({deleted: lawsuitId}); //return the deleted message
    } catch(err){
        return next(err);
    }
});

module.exports = router; //export the routers