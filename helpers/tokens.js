//jsonwebtoken(jwt) is a stndard for creating and verifying jason tokens, which is used to
//share security information between clients and servers.Each JWT contains encoded JSON objects, including 
//a set of claims.
//The claims are the data that is being shared between the client and server.
//The claims are signed by a secret key, which is only known by the server.
//The secret key is used to verify the claims.


const jwt = require("jsonwebtoken");  //npm install jsonwebtoken
const { SECRET_KEY } = require("../config"); 

/** return signed JWT from employee data. */

function createToken(employee) { 
  console.assert(employee.isAdmin !== undefined, 
      "createToken passed employee without isAdmin property");

  let payload = { //payload is a json object that is encoded in the token.
    username: employee.username, 
    isAdmin: employee.isAdmin || false, 
  };

  return jwt.sign(payload, SECRET_KEY); //sign the payload with the secret key.
}

module.exports = { createToken }; //export the function createToken to be used elsewhere.