CREATE TABLE departments(
    handle VARCHAR(25) PRIMARY KEY, CHECK (handle=lower(handle)),
    name TEXT UNIQUE NOT NULL,
    num_employees INTEGER CHECK (num_employees>=0),
    description TEXT NOT NULL
);

CREATE TABLE employees (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE lawsuits(
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    location TEXT NOT NULL,
    department_handle VARCHAR(25) NOT NULL 
       REFERENCES departments ON DELETE CASCADE
);

CREATE TABLE assignments (
  username VARCHAR(25)
    REFERENCES employees ON DELETE CASCADE,
  lawsuit_id INTEGER
    REFERENCES lawsuits ON DELETE CASCADE,
  PRIMARY KEY (username, lawsuit_id)
);
