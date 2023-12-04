/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * This file contains the authentication middleware for the backend.
 */

const jwt = require("jsonwebtoken");

/*
This middleware is used to authenticate the user before they can access the endpoints. 
It checks if the token is valid and then passes down the user details to the endpoints.

request: The request object
response: The response object
next: The next function to call
*/
module.exports = async (request, response, next) => {
    try {
        // get the token from the authorization header
        const token = await request.headers.authorization.split(" ")[1];

        // check if the token matches the supposed origin
        const decodedToken = await jwt.verify(token, "RANDOM-TOKEN");

        // retrieve the user details of the logged in user
        const user = await decodedToken;

        // pass the user down to the endpoints here
        request.user = user;

        // pass down functionality to the endpoint
        next();

    } catch (error) {
        response.status(401).json({
            error: new Error("Invalid request!"),
        });
    }
};
