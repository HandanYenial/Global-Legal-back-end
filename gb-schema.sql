CREATE TABLE departments(
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    num_employees INTEGER NOT NULL,
    description TEXT NOT NULL,
);

CREATE TABLE employees(
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE cases(
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    location TEXT NOT NULL,
    department_id INTEGER NOT NULL 
       REFERENCES departments ON DELETE CASCADE,
);

CREATE TABLE assignments(
    username VARCHAR(25)
        REFERENCES employees ON DELETE CASCADE,
    case_id INTEGER
        REFERENCES cases ON DELETE CASCADE,
    PRIMARY KEY (username, case_id)
)
