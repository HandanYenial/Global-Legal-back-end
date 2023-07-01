"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


    //related functions for departments
    //Create a law firm category(from data), update database, return new category data
    //data should be {handle, name, num_employees, description}
    //returns {handle, name, num_employees, description}
    //throw BadREquestError if the category already in the database

class Category {
    static async create({ handle, name, numEmployees, description }){
        const duplicateCheck = await db.query(
            `SELECT handle FROM categories WHERE handle = $1`,
            [handle]
        );
        if (duplicateCheck.rows[0]){
            throw new BadRequestError(`Duplicate category: ${handle}`);
        }
        const result = await db.query(
            `INSERT INTO categories(
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
        const category = result.rows[0];

        return category;
        }

        //Find all categories
        //searchFilter: name
        //returns [{handle, name, num_employees, description}, ...]

        static async findAll(searchFilters = {}){
            let query = `SELECT handle, 
                                name,
                                num_employees AS "numEmployees",
                                description
                         FROM categories`;
            let whereExpressions = []; //WHERE name=$1, WHERE name= criminal
            let queryValues =[]; //['criminal'] for search by name

            const { handle} = searchFilters;

            if (handle){
                queryValues.push(`%${handle}%`);
                whereExpressions.push(`handle ILIKE $${queryValues.length}`);//ILIKE: lawsuit insensitive
            }

            if (whereExpressions.length > 0){
                query += " WHERE " + whereExpressions.join(" AND ");
            }
            //Finalizing query and return results
            
            query += " ORDER BY handle";
            const categoriesRes = await db.query(query, queryValues);
            return categoriesRes.rows;
        }

        //Given a category handle, return data about category
        //throws NotFoundError if not found
        //returns {handle, name, num_employees, description, lawsuits} 
        //where lawsuits is [{id, title, description, comment, location, category_handle}, ...]

        static async get(handle){
            const categoryRes = await db.query(
                `SELECT handle,
                        name,
                        num_employees AS "numEmployees",
                        description
                FROM categories
                WHERE handle = $1`,
                [handle] 
            );

            const category = categoryRes.rows[0];

            if(!category){
                throw new NotFoundError(`No category: ${handle}`);
            }

            const lawsuitsRes = await db.query(
                `SELECT id,
                title,
                description,
                comment,
                location,
                created_at AS "createdAt",
                updated_at AS "updatedAt"
                FROM lawsuits
                WHERE category_handle = $1
                ORDER BY id`,
                [handle],
            );

            category.lawsuits = lawsuitsRes.rows;

            return category;
        }

        //Update category data with 'data'
        //This is a "partial update" --- data can contain just {name, num_employees, description}
        //or any combination of those
        //throws NotFoundError if not found

        static async update(handle, data){//data can be name, num_employees, description
            const { setCols , values } = sqlForPartialUpdate(
                data,
                {
                    numEmployees : "num_employees",
                    description : "description",
                    
                });
            const handleVarIdx = "$" + (values.length + 1);

            const querySql = `UPDATE categories
                              SET ${setCols}
                              WHERE handle = ${handleVarIdx}
                              RETURNING handle,
                                        name,
                                        num_employees AS "numEmployees",
                                        description`;
            const result = await db.query(querySql, [...values, handle]);
            const category = result.rows[0];

            if(!category) throw new NotFoundError(`No category: ${handle}`);

            return category;
        }
        //Delete given category from database; returns undefined
        //throws NotFoundError if category not found

        static async remove(handle){
            const result = await db.query(
                `DELETE
                FROM categories
                WHERE handle = $1
                RETURNING handle`,
                [handle]
            );

            const category = result.rows[0];
            if(!category) throw new NotFoundError(`No category: ${handle}`);
        }
        
    }

    module.exports = Category;
