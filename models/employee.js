"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config.js");

//related functions for employees

class Employee {
    //authenticate employee by username and password
    //returns {username,first_name, last_name,email, is_admin}
    //UnauthorizedError: if employee not found or password wrong

    static async authenticate(username, password){
        //chek if there is an employee with the username
        const result = await db.query(
           `SELECT username,
                    password,
                    first_name AS "firstname",
                    last_name as "lastname",
                    email,
                    is_admin as "isAdmin"
            FROM employees
            WHERE username = $1`,
            [username],
        );

        const employee = result.rows[0];

        if(employee){
            //compare hashed password with the new one in the database
            const isValid = await bcrypt.compare(password, employee.password);
            if(isValid === true){
                delete employee.password;
                return employee;
            }
        }
        throw new UnauthorizedError("Invalid username/password");
    }

    //register employee with data
    //returns {username, first_name, last_name, email, is_admin}
    //BadRequestError: if employee already in database

    static async register({username, password, firstname, lastname,email,isAdmin}){
        const duplicateCheck = await db.query(
            `SELECT username
            FROM employees
            WHERE username = $1`,
            [username], 
        );

        if(duplicateCheck.rows[0]){
            throw new BadRequestError(`Duplicate username: ${username}`);
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        const result = await db.query(
           `INSERT INTO employees(username, password,first_name,last_name,email,is_admin)
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING
            username, first_name AS "firstname", lastname AS "lastname", email, is_admin AS "isAdmin"`,
            [username , hashedPassword, firstname, lastname, email, isAdmin],
        );
        const employee = result.rows[0];
        return employee;

        }
        //Find all employees
        //Returns [{username, first_name, last_name, email, is_admin}, ...]

    static async findAll(){
        const result =await db.query(
            `SELECT username,
                    first_name AS "firstname",
                    last_name AS lastname,
                    email
                    is_admin AS "isAdmin"
            FROM employees
            ORDER BY username`,
            );
        return result.rows; //return array of employees
    }

        // When given a username, return data about employee
        //Returns { username, first_name, last_name, email, is_admin , lawsuits }
        //where lawsuits is {id, title, description, status, location, department_handle}
        //NotFoundError : if employee not found

    static async get(username){
        const employeeREs = await db.query(
            `SELECT username,
                    first_name AS "firstname",
                    last_name AS "lastname",
                    email,
                    is_admin AS "isAdmin"
            FROM employees
            WHERE username = $1`,
            [username],
        );
        const employee = userRes.rows[0];

        if (!user) throw new NotFoundError(`No employee: ${username}`);

        const assignedlawsuitsRes = await db.query(
            `SELECT a.job_id
            FROM assignments AS a
            WHERE a.username = $1`,
            [username]
            );
        
        employee.assignments = assignedlawsuitsRes.rows.map(a => a.lawsuit_id);
        return employee;
    }

    //Update employee data with 'data'
    //This is a "partial update" --- it's fine if data doesn't contain all the fields;
    //this only changes provided fields.
    //Data can include{firstname. lastname, password, email, isAdmin}
    //Returns {username, first_name, last_name, email, is_admin}
    //NotFoundError: if employee not found

    static async update(username,data){
        if(data.password){
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }

        const {setCols, values} = sqlForPartialUpdate(
            data,
            {
                firstname : "first_name",
                lastname : "last_name",
                isAdmin : "is_admin",
            }
        );
        const usernameVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE employees
                          SET ${setCols}
                          WHERE username = ${usernameVarIdx}
                          RETURNING username,
                                    first_name AS "firstname",
                                    last_name AS "lastname",
                                    email,
                                    is_admin AS "isAdmin"`;
        const result = await db.query(querySql, [...values, username]);
        const employee = result.rows[0];

        if(!employee) throw new NotFoundError(`No employee: ${username}`);

        delete employee.password;
        return employee;
    }

    //Delete given user from database; returns undefined

    static async remove(username){
        let result = await db.query(
            `DELETE FROM employees
            WHERE username = $1
            RETURNING username`,
            [username],
        );
        const employee = result.rows[0];

        if(!employee) throw new NotFoundError(`No employee: ${username}`);
    }

    /**Apply for job: update db
     * returns udnefined
     * username: username of employee
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
               FROM employees
               WHERE username = $1`,
               [username],
               );
        const employee = preCheck2.rows[0];

        if(!employee) throw new NotFoundError(`There is no such employee : ${username}`);

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
               FROM employees
               WHERE username = $1`,
               [username],
               );
        const employee = preCheck2.rows[0];

        if(!employee) throw new NotFoundError(`There is no such employee : ${username}`);

        await db.query(
              `DELETE FROM assignments
              WHERE lawsuit_id = $1 AND username = $2`,
              [lawsuitId, username],
        );
    }
}

module.exports = Employee;