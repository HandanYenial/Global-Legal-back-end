"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError } = require("../expressError");

//Related functions for lawsuits

class Lawsuit {
    //Create a lawsuit from data
    //update the database and return the new lawsuit data
    //including: {id, title, description, status,location, department_id}

    static async create(data){
        const result = await db.query(
            `INSERT INTO lawsuits(
                title,
                description,
                status,
                location,
                department_handle)
            VALUES ($1,$2,$3,$4,$5)
            RETURNING id, title, description, status, location, department_handle AS "departmentHandle"`,
            [
                data.title,
                data.description,
                data.status,
                data.location,
                data.departmentHandle,
            ]
        );
        let lawsuit = result.rows[0];
        return lawsuit;
    }

    //Find all lawsuits(filter by title)
    //Returns [{id, title, description, status, location, department_handle}, ...]

    static async findAll({title} = {}){
        let query = `SELECT l.id,
                            l.title,
                            l.description,
                            l.status,
                            l.location,
                            l.department_handle AS "departmentHandle"
                            d.name AS "departmentName"
                    FROM lawsuits AS l
                        LEFT JOIN departments AS d ON d.handle = l.department_handle`;
        let whereExpressions = [];
        let queryValues = [];

        //for search term :title add to where expressions and query values

        if(title !== undefined){
            queryValues.push(`%${title}%`);
            whereExpressions.push(`title ILIKE $${queryValues.length}`);
        }

        if(whereExpressions.length > 0){
            query += " WHERE " + whereExpressions.join(" AND ");
        }

        //Finalize query and return results
        query += " ORDER BY id";
        const lawsuitsRes = await db.query(query, queryValues);
        return lawsuitsRes.rows;
    }

    //Given a lawsuit id, return data about lawsuit
    //Returns {id, title, description, status, location, department_handle}
    //where department is {handle, name, description, numEmployees}

    static async get(id){
        const lawsuitRes = await db.query(
            `SELECT id,
                    title,
                    description,
                    status,
                    location,
                    department_handle AS "departmentHandle"
            FROM lawsuits
            WHERE id = $1`,
            [id],
        );
    
    const lawsuit = lawsuitRes.rows[0];

    if(!lawsuit) throw new NotFoundError(`No lawsuit: ${id}`);

    const departmentsRes = await db.query(
        `SELECT handle,
                name,
                num_employees AS "numEmployees",
                description
        FROM departments
        WHERE handle = $1`,
        [lawsuit.departmentHandle],
    );

    delete lawsuit.departmentHandle;
    lawsuit.department = departmentsRes.rows[0];

    return lawsuit;
    }
}

module.exports = Lawsuit;