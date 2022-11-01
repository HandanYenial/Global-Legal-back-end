"use strict";

//Middleware to handle common auth tasks in routes
//Middleware is a function that has access to the request object (req), the response object (res), 
//and the next middleware function in the application’s request-response cycle.
//The next middleware function is commonly denoted by a variable named next.

const jwt = require("jsonwebtoken"); //jsonwebtoken is a library to generate and verify tokens
const { SECRET_KEY } = require("../config"); //secret_key is used to sign the token
const { UnauthorizedError } = require("../expressError"); 

/** Middleware to authenticate user. 
 * If a token is provided, verify the token
 * If the the provided token is valid store the token payload on res.locals
 * (this will include the username and isAdmin)
 * jsonwebtoken consists of 3 parts: header, payload, signature
 * header: type of token and hashing algorithm
 * payload: data
 * signature: header and payload are encoded and signed with secret key
*/

function authenticateJWT(req,res,next){ //authenticate the user
    try{
        const authHeader = req.headers && req.headers.authorization;//Get the auth header
        if(authHeader){
            const token = authHeader.replace(/^[Bb]earer /, "").trim(); //Remove Bearer from token
            res.locals.user = jwt.verify(token, SECRET_KEY);//Verify token
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
        if(!res.locals.user) throw new UnauthorizedError();
        return next();
    } catch(err){
        return next(err);
    }
}

//Middleware to use when they must be admin
//If not raise an error : UnauthorizedError

function ensureAdmin(req,res,next){
    try{
        if(!res.locals.user || !res.locals.user.isAdmin) {
            throw new UnauthorizedError();
        }
        return next();
    } catch(err){
        return next(err);
    }
}
    
//Middleware to use when they must provide a valid token and be user matching username provided as route param.
//If not raise an error : UnauthorizedError

function ensureCorrectUserOrAdmin(req,res,next){
    try{
        const user = res.locals.user;
        if(!(user && (user.isAdmin || user.username === req.params.username))){
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
    ensureCorrectUserOrAdmin,
};
