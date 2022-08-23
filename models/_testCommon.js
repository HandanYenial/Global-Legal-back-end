const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testLawsuitIds = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM categories");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  await db.query(`
    INSERT INTO categories(handle, name, num_employees, description)
    VALUES ('c1', 'C1', 1, 'Desc1'),
           ('c2', 'C2', 2, 'Desc2'),
           ('c3', 'C3', 3, 'Desc3')`
    );

  const resultsLawsuits = await db.query(`
    INSERT INTO lawsuits (title, description, comment, location, category_handle, created_at, updated_at)
    VALUES ('Lawsuit1', 'Desc1', 'open', 'loc1', 'd1', '2021-01-01', '2021-01-01'),
           ('Lawsuit2', 'Desc2', 'open', 'loc2', 'd2', '2021-01-01', '2021-01-01'),
           ('Lawsuit3', 'Desc3', 'open', 'loc3', 'd3', '2021-01-01', '2021-01-01'),
           ('Lawsuit4', 'Desc4', 'open', 'loc4', 'd1', '2021-01-01', '2021-01-01'),
    RETURNING id`);
  testLawsuitIds.splice(0, 0, ...resultsLawsuits.rows.map(r => r.id));

  await db.query(`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
      [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      ]);

  await db.query(`
        INSERT INTO assignments(username, lawsuit_id)
        VALUES ('u1', $1)`,
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