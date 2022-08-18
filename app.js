//Handle 404 errors
app.use(function(req,res,next){
    return next(new NotFoundError());
});

//Handle other errors
app.use(function(err,req,res,next){
    if(process.env.NODE_ENV !== 'test'){ //Don't log errors during tests
        console.error(err.stack);//Log the error stack
    }
    const status = err.status || 500; //Set the status code
    const message = err.message;//Set the error message

    return res.status(status).json({error: {message,status}});//Return the error message
});

module.exports = app;
