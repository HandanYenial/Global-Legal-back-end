CREATE TABLE categories(
    handle VARCHAR(25) PRIMARY KEY CHECK (handle=lower(handle)),
    name TEXT UNIQUE NOT NULL,
    num_employees INTEGER CHECK (num_employees>=0),
    description TEXT NOT NULL
);

CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE lawsuits(
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  comment TEXT NOT NULL,
  location TEXT NOT NULL,
  category_handle VARCHAR(25)
    REFERENCES categories ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assignments (
  username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
  lawsuit_id INTEGER
    REFERENCES lawsuits ON DELETE CASCADE,
  PRIMARY KEY (username, lawsuit_id)
);
