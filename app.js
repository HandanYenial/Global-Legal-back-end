"use strict";

/** Express app for global-legal. */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const departmentsRoutes = require("./routes/departments");
const employeesRoutes = require("./routes/employees");
const lawsuitsRoutes = require("./routes/lawsuits");

const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/departments", departmentsRoutes);
app.use("/employees", employeesRoutes);
app.use("/lawsuits", lawsuitsRoutes);


//Handle 404 errors
app.use(function(req,res,next){
    return next(new NotFoundError());
});

//Handle other errors
app.use(function(err,req,res,next){
    if(process.env.NODE_ENV !== 'test') console.error(err.stack);//Log the error stack
    const status = err.status || 500; //Set the status code
    const message = err.message;//Set the error message

    return res.status(status).json(
        {error: {message,status}
    });//Return the error message
});

module.exports = app;
