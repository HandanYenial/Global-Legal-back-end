"use strict";

//Middleware to handle common auth tasks in routes

const jwt = require("jsonwebtoken"); //Import JWT
const { SECRET_KEY } = require("../config"); //Import secret key
const { UnauthorizedError } = require("../expressError"); //Import error

/** Middleware to authenticate employee. 
 * If a token is provided, verify the token
 * If the the provided token is valid store the token payload on res.locals
 * (this will include the username and isAdmin)
 * 
*/

function authenticateJWT(req,res,next){
    try{
        const authHeader = req.headers && req.headers.autherization;//Get the auth header
        if(authHeader){
            const token = authHeader.replace(/^[Bb]earer /, "").trim(); //Remove Bearer from token
            res.locals.employee = jwt.verify(token, SECRET_KEY);//Verify token
        }
        return next();
    } catch(err){
        return next();
    }
}

//Middleware to use when they must be logged in
//If not raise an error : UnauthorizedError

function ensureLoggedIn(req,res,next){
    try{
        if(!res.locals.employee) throw new UnauthorizedError();
        return next();
    } catch(err){
        return next(err);
    }
}

//Middleware to use when they must be admin
//If not raise an error : UnauthorizedError

function ensureAdmin(req,res,next){
    try{
        if(!res.locals.employee || !res.locals.employee.isAdmin) {
            throw new UnauthorizedError();
        }
        return next();
    } catch(err){
        return next(err);
    }
}
    
//Middleware to use when they must provide a valid token and be user matching username provided as route param.
//If not raise an error : UnauthorizedError

function ensureCorrectEmployeeOrAdmin(req,res,next){
    try{
        const employee = res.locals.employee;
        if(!(employee && (employee.isAdmin || employee.username === req.params.username))){
            throw new UnauthorizedError();
        }
        return next();
    } catch(err){
        return next(err);
    }
}

module.exports = {
    authenticateJWT,
    ensureLoggedIn,
    ensureAdmin,
    ensureCorrectEmployeeOrAdmin,
};
