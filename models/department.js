"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("..expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { compareSync } = require("bcrypt");

//realated functions for deparments
class Department {
    //Create a law firm department(from data), update database, return new department data
    //data should be {handle, name, num_employees, description}
    //returns {handle, name, num_employees, description}
    //throw BadREquestError if department already in database

    static async create({ handle, name, numEmployees, description }){
        const duplicateCheck = await db.query(
            `SELECT handle FROM departments WHERE handle = $1`,
            [handle]
        );
        if (duplicateCheck.rows[0]){
            throw new BadRequestError(`Duplicate department: ${handle}`);
        }
        const result = await db.query(
            `INSERT INTO departments(
                                handle,
                                name,
                                num_employees,
                                description)
            VALUES($1, $2, $3, $4)
            RETURNING handle, 
                      name, 
                      num_employees AS "numEmployees",
                      description `,
            [handle, name, numEmployees, description],
        );
        const department = result.rows[0];

        return department;
        }

        //Find all departments
        //seacrhfilter: name
        //returns [{handle, name, num_employees, description}, ...]

        static async findAll(searchFilters = {}){
            let query = `SELECT handle, 
                                name,
                                num_employees AS "numEmployees",
                                description
                         FROM departments`;
            let whereExpressions = []; //WHERE name=$1, WHERE name= criminal
            let queryValues =[]; //['criminal'] for search by name

            const { name } = searchFilters;

            if (name){
                queryValues.push(`%${name}%`);
                whereExpressions.push(`name ILIKE $${queryValues.length}`);//ILIKE: lawsuit insensitive
            }

            if (whereExpressions.length > 0){
                query += " WHERE " + whereExpressions.join(" AND ");
            }
            //Finalizing query and return results
            query += " ORDER BY name";
            const departmentsRes = await db.query(query, queryValues);
            return departmentsRes.rows;
        }

        //Given a department handle, return data about department
        //throws NotFoundError if not found
        //returns {handle, name, num_employees, description, lawsuits} 
        //where lawsuits is [{id, title, description, status, location, department_handle}, ...]

        static async get(handle){
            const departmentRes = await db.query(
                `SELECT handle,
                        name,
                        num_employees AS "numEmployees",
                        description
                FROM departments
                WHERE handle = $1`,
                [handle] 
            );

            const department = departmentRes.rows[0];

            if(!department){
                throw new NotFoundError(`No department: ${handle}`);
            }

            const lawsuitsRes = await db.query(
                `SELECT id, title, description, status, location
                FROM lawsuits
                WHERE department_handle = $1
                ORDER BY id`,
                [handle],
            );

            department.lawsuits = lawsuitsRes.rows;

            return department;
        }

        //Update department data with 'data'
        //This is a "partial update" --- data can contain just {name, num_employees, description}
        //or any combination of those
        //throws NotFoundError if not found

        static async update(handle, data){//data can be name, num_employees, description
            const { setCols , values } = sqlForPartialUpdate(
                data,
                {
                    numEmployees : "num_employees",
                    description : "description"
                });
            const handleVarIdx = "$" + (values.length + 1);

            const querySql = `UPDATE departments
                              SET ${setCols}
                              WHERE handle = ${handleVarIdx}
                              RETURNING handle,
                                        name,
                                        num_employees AS "numEmployees",
                                        description`;
            const result = await db.query(querySql, [...values, handle]);
            const department = result.rows[0];

            if(!department) throw new NotFoundError(`No department: ${handle}`);

            return department;
        }
        //Delete given department from database; returns undefined
        //throws NotFoundError if department not found

        static async remove(handle){
            const result = await db.query(
                `DELETE
                FROM departments
                WHERE handle = $1
                RETURNING handle`,
                [handle]
            );

            const department = result.rows[0];
            if(!department) throw new NotFoundError(`No department: ${handle}`);
        }
        
    }

    module.exports = Department;
