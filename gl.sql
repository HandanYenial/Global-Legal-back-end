\echo 'Delete and recreate the gl database?'
\prompt 'Return for yes or control-c to cancel>'foo

DROP DATABASE gl;
CREATE DATABASE gl;
\connect gl

\i gl-schema.sql
\i gl-seed.sql

\echo 'Delete and recreate the gl_test database?'
\prompt 'Return for yes or control-c to cancel>'foo

DROP DATABASE gl_test;
CREATE DATABASE gl_test;
\connect gl_test

\i gl-schema.sql