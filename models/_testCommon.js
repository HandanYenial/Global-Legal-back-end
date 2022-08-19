const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testLawsuitIds = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM departments");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM employees");

  await db.query(`
    INSERT INTO departments(handle, name, num_employees, description)
    VALUES ('d1', 'D1', 1, 'Desc1'),
           ('d2', 'D2', 2, 'Desc2'),
           ('d3', 'D3', 3, 'Desc3')`
    );

  const resultsLawsuits = await db.query(`
    INSERT INTO lawsuits (title, description, status, location, department_handle)
    VALUES ('Lawsuit1', 'Desc1', 'open', 'loc1', 'd1'),
           ('Lawsuit2', 'Desc2', 'open', 'loc2', 'd2'),
           ('Lawsuit3', 'Desc3', 'open', 'loc3', 'd3')
           ('Lawsuit4', 'Desc4', 'open', 'loc4', 'd1')
    RETURNING id`);
  testLawsuitIds.splice(0, 0, ...resultsLawsuits.rows.map(r => r.id));

  await db.query(`
        INSERT INTO employees(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('e1', $1, 'E1F', 'E1L', 'e1@email.com'),
               ('e2', $2, 'E2F', 'E2L', 'e2@email.com')
        RETURNING username`,
      [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      ]);

  await db.query(`
        INSERT INTO assignments(username, lawsuit_id)
        VALUES ('e1', $1)`,
      [testLawsuitIds[0]]);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testLawsuitIds,
};