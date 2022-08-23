"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config.js");

//related functions for users

class User {
    //authenticate user by username and password
    //returns {username,first_name, last_name,email, is_admin}
    //UnauthorizedError: if user not found or password wrong

    static async authenticate(username, password){
        //chek if there is an user with the username
        const result = await db.query(
           `SELECT username,
                    password,
                    first_name AS "firstName",
                    last_name as "lastName",
                    email,
                    is_admin as "isAdmin"
            FROM users
            WHERE username = $1`,
            [username],
        );

        const user = result.rows[0];

        if(user){
            //compare hashed password with the new one in the database
            const isValid = await bcrypt.compare(password, user.password); //true or false
            if(isValid === true){ //if password is valid
                delete user.password; 
                return user; 
            }
        }
        throw new UnauthorizedError("Invalid username/password");
    }

    //register user with data
    //returns {username, first_name, last_name, email, is_admin}
    //BadRequestError: if user already in database

    static async register({username, password, firstName, lastName,email,isAdmin}){
        const duplicateCheck = await db.query(
            `SELECT username
            FROM users
            WHERE username = $1`,
            [username], 
        );

        if(duplicateCheck.rows[0]){
            throw new BadRequestError(`Duplicate username: ${username}`);
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR); //hash password

        const result = await db.query(
           `INSERT INTO users(
                 username,
                 password,
                 first_name,
                 last_name,
                 email,
                 is_admin)
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING
            username,first_name AS "firstName",lastname AS "lastName",email,is_admin AS "isAdmin"`,
            [username , hashedPassword, firstName, lastName, email, isAdmin],
        );
        const user = result.rows[0];
        return user;

        }
        //Find all users
        //Returns [{username, first_name, last_name, email, is_admin}, ...]

    static async findAll(){
        const result =await db.query(
            `SELECT username,
                    first_name AS "firstName",
                    last_name AS lastName,
                    email,
                    is_admin AS "isAdmin"
            FROM users
            ORDER BY username`,
            );
        return result.rows; //return array of users
    }

        // When given a username, return data about user
        //Returns { username, first_name, last_name, email, is_admin , lawsuits }
        //where lawsuits is {id, title, description, comment, location, category_handle}
        //NotFoundError : if user not found

    static async get(username){
        const userRes = await db.query(
            `SELECT username,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    is_admin AS "isAdmin"
            FROM users
            WHERE username = $1`,
            [username],
        );
        const user = userRes.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        const userLawsuitsRes = await db.query(
            `SELECT a.lawsuit_id
            FROM assignments AS a
            WHERE a.username = $1`,
            [username]
            );
        
        user.assignments = userLawsuitsRes.rows.map(a => a.lawsuit_id);
        return user;
    }

    //Update user data with 'data'
    //This is a "partial update" --- it's fine if data doesn't contain all the fields;
    //this only changes provided fields.
    //Data can include{firstname. lastname, password, email, isAdmin}
    //Returns {username, first_name, last_name, email, is_admin}
    //NotFoundError: if user not found

    static async update(username,data){
        if(data.password){
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }

        const {setCols, values} = sqlForPartialUpdate(
            data,
            {
                firstName : "first_name",
                lastName : "last_name",
                isAdmin : "is_admin",
            }
        );
        const usernameVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE users
                          SET ${setCols}
                          WHERE username = ${usernameVarIdx}
                          RETURNING username,
                                    first_name AS "firstName",
                                    last_name AS "lastName",
                                    email,
                                    is_admin AS "isAdmin"`;
        const result = await db.query(querySql, [...values, username]);
        const user = result.rows[0];

        if(!user) throw new NotFoundError(`No user: ${username}`);

        delete user.password;
        return user;
    }

    //Delete given user from database; returns undefined

    static async remove(username){
        let result = await db.query(
            `DELETE 
            FROM users
            WHERE username = $1
            RETURNING username`,
            [username],
        );
        const user = result.rows[0];

        if(!user) throw new NotFoundError(`No user: ${username}`);
    }

    /**Assign for lawsuit: update db
     * returns udnefined
     * username: username of user
     * lawsuitId : lawsuit_id
     * 
     */

    static async addLawsuit(username, lawsuitId){
        const preCheck = await db.query(
            `SELECT id
            FROM lawsuits
            WHERE id=$1`,
            [lawsuitId],
        );
        const lawsuit = preCheck.rows[0];

        if(!lawsuit) throw new NotFoundError(`There is no such lawsuit : ${lawsuitId}`);

        const preCheck2 = await db.query(`
               SELECT username
               FROM users
               WHERE username = $1`,
               [username],
               );
        const user = preCheck2.rows[0];

        if(!user) throw new NotFoundError(`There is no such user : ${username}`);

        await db.query(
              `INSERT INTO assignments (lawsuit_id, username)
              VALUES ($1, $2)`,
              [lawsuitId, username],
        );
    }

    static async removeLawsuit(username, lawsuitId){
        const preCheck = await db.query(
            `SELECT id
            FROM lawsuits
            WHERE id=$1`,
            [lawsuitId],
        );
        const lawsuit = preCheck.rows[0];

        if(!lawsuit) throw new NotFoundError(`There is no such lawsuit : ${lawsuitId}`);

        const preCheck2 = await db.query(`
               SELECT username
               FROM users
               WHERE username = $1`,
               [username],
               );
        const user = preCheck2.rows[0];

        if(!user) throw new NotFoundError(`There is no such user : ${username}`);

        await db.query(
              `DELETE FROM assignments
              WHERE lawsuit_id = $1 AND username = $2`,
              [lawsuitId, username],
        );
    }
}

module.exports = User;