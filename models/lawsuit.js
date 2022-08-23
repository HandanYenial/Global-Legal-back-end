"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError } = require("../expressError");

//Related functions for lawsuits

class Lawsuit {
    //Create a lawsuit from data
    //update the database and return the new lawsuit data
    //including: {id, title, description, comment,location, category_id}

    static async create(data){
        const result = await db.query(
            `INSERT INTO lawsuits(
                title,
                description,
                comment,
                location,
                category_handle,
                created_at,
                updated_at)
            VALUES ($1,$2,$3,$4,$5,to_timestamp(${ Date.now()}),to_timestamp(${ Date.now()}))
            RETURNING id, title, description, comment, location, category_handle AS "categoryHandle", created_at AS "createdAt", updated_at AS "updatedAt"`,
            [
                data.title,
                data.description,
                data.comment,
                data.location,
                data.categoryHandle,
            ]
        );
        let lawsuit = result.rows[0];
        return lawsuit;
    }

    //Find all lawsuits(filter by title)
    //Returns [{id, title, description, comment, location, category_handle}, ...]

    static async findAll({title} = {}){
        let query = `SELECT lawsuit.id,
                            lawsuit.title,
                            lawsuit.description,
                            lawsuit.comment,
                            lawsuit.location,
                            lawsuit.category_handle AS "categoryHandle"
                            lawsuit.created_at AS "createdAt",
                            lawsuit.updated_at AS "updatedAt",
                            category.name AS "categoryName"
                    FROM lawsuits AS lawsuit
                        LEFT JOIN categories AS category ON category.handle = lawsuit.category_handle`;
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
        query += " ORDER BY title";
        const lawsuitsRes = await db.query(query, queryValues);
        return lawsuitsRes.rows;
    }

    //Given a lawsuit id, return data about lawsuit
    //Returns {id, title, description, comment, location, category_handle}
    //where category is {handle, name, description, numEmployees}

    static async get(id){
        const lawsuitRes = await db.query(
            `SELECT id,
                    title,
                    description,
                    comment,
                    location,
                    category_handle AS "categoryHandle"
            FROM lawsuits
            WHERE id = $1`,
            [id],
        );
    
    const lawsuit = lawsuitRes.rows[0];

    if(!lawsuit) throw new NotFoundError(`No lawsuit: ${id}`);

    const categoriesRes = await db.query(
        `SELECT handle,
                name,
                num_employees AS "numEmployees",
                description
        FROM categories
        WHERE handle = $1`,
        [lawsuit.categoryHandle],
    );

    delete lawsuit.categoryHandle;
    lawsuit.category = categoriesRes.rows[0];

    return lawsuit;
    }


//Update lawsuit with 'data'
//This is a "partial update" --- it's fine if data doesn't contain all the fields;
//this only changes provided fields.
//Returns {id, title, description, comment, location, category_handle}

    static async update(id,data){
       const{ setCols, values } = sqlForPartialUpdate(
              data,
              {}
         );
         const idVarIdx = "$" + (values.length + 1);
    
         const querySql = `UPDATE lawsuits
                             SET ${setCols}
                             WHERE id = ${idVarIdx}
                             RETURNING id,
                                      title,
                                      description,
                                      comment,
                                      location,
                                      category_handle AS "categoryHandle",
                                      created_at AS "createdAt",
                                      updated_at AS "updatedAt"`;
          const result = await db.query(querySql, [...values, id]);
          const lawsuit = result.rows[0];
    
          if(!lawsuit) throw new NotFoundError(`No lawsuit: ${id}`);
    
          return lawsuit;
    }

    //Delete given lawsuit from database; returns undefined.
    static async remove(id){
        let result = await db.query(
            `DELETE
            FROM lawsuits
            WHERE id = $1
            RETURNING id`,
            [id]
        );
        const lawsuit = result.rows[0];

        if(!lawsuit) throw new NotFoundError(`No lawsuit: ${id}`);
    }
}


module.exports = Lawsuit;