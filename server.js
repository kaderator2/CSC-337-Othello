const mongoose = require("mongoose");
const express = require("express");
const app = express();
const port = 5000;
const cookieParser = require('cookie-parser');
const bcrypt = require("bcrypt")

//Set up DB
const db = mongoose.connection;
const mongoDBURL = "mongodb://127.0.0.1:27017/ostaa";
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(express.static("public_html"));
app.use(express.json());
app.use(cookieParser());

/**
 * Specifies the required schemas for the database, items and users.
 */
const Schema = mongoose.Schema;
// TODO: change schemas here as needed
const ItemSchema = new Schema({
    title: String,
    description: String,
    image: String,
    price: Number,
    stat: String
});

const UserSchema = new Schema({
    username: String,
    password: String,
    listings: [],
    purchases: []
});

var Item = mongoose.model('Item', Schema1);
var User = mongoose.model('User', Schema2);

/**
 * This function is a middleware function that authenticates a user by checking their cookie.
 * If the cookie is valid, the user is allowed to proceed, otherwise they are redirected to the
 * login page.
 * @param req the request object containing the cookie
 * @param res the response object
 * @param next the next function to call
 */
function authenticate(req, res, next) {
    let c = req.cookies;
    console.log('auth request:');
    console.log(req.cookies);
    if (c != undefined) {
        if (sessions[c.login.username] != undefined &&
            sessions[c.login.username].id == c.login.sessionID) {
            next();
        } else {
            res.redirect('/index.html');
        }
    } else {
        res.redirect('/index.html');
    }
}
let sessions = {};

/**
 * Initialize the express app and configures JSON parsing, static file serving, and cookie
 * parsing. Also sets up the authentication middleware with the authenticate function.
 */

app.use('/app/*', authenticate);
app.get('/app/*', (req, res, next) => {
    console.log('another');
    next();
});

/**
 * This function adds a session to the array of session objects and returns a unique session id.
 * @param username the username of the user to add a session for
 * @returns a unique session id
 */
function addSession(username) {
    let sid = Math.floor(Math.random() * 1000000000);
    let now = Date.now();
    sessions[username] = { id: sid, time: now };
    return sid;
}

/**
 * This function removes sessions from the array of session objects if they are older than
 * 120000 milliseconds (2 minutes).
 */
function removeSessions() {
    let now = Date.now();
    let usernames = Object.keys(sessions);
    for (let i = 0; i < usernames.length; i++) {
        let last = sessions[usernames[i]].time;
        if (last + 120000 < now) {
            delete sessions[usernames[i]];
        }
    }
    console.log(sessions);
}

//Run removeSessions every 2 seconds to handle session management
//and remove old sessions from the array of sessions.
setInterval(removeSessions, 2000);

mongoose.connect(mongoDBURL, {
    useNewUrlParser: true
}).then(() => {
    //Receives the request to add a user to the database
    app.post("/add/user/", (req, res) => {
        registerNewUser(req, res);
    });

    app.post('/login/', (req, res) => {
        attemptUserLogin(req, res);
    });

    app.listen(port, () =>
        console.log(`App listening at port ${port}`));

});


function attemptUserLogin(req, res) {
    let userData = req.body;
    let p1 = User.find({ username: userData.username }).exec();
    p1.then((results) => {
        if (results.length == 0) {
            res.end('could not find account');
        } else {
            bcrypt.compare(userData.password, p1.password, function (err, result) {
                if (result) {
                    let sid = addSession(u.username);
                    res.cookie("login",
                        { username: u.username, sessionID: sid },
                        { maxAge: 80000 * 2 });
                    res.end('SUCCESS');
                }
                else {
                    res.end('INVALID USERNAME OR PASSWORD');
                }
            });
        }
    });
}

function registerNewUser(req, res) {
    let userData = req.body;
    if (userData.username === "" || userData.password === "") {
        res.end('INVALID INPUT');
    }
    let p1 = User.find({ username: userData.username }).exec();
    p1.then((results) => {
        if (results.length == 0) {
            bcrypt.hash(userData.password, 10, function (err, hash) {
                let u = new User({
                    username: userData.username,
                    password: hash,
                    listings: [],
                    purchases: []
                });
            });
            let p = u.save();
            p.then(() => {
                res.end('USER CREATED');
            });
            p.catch(() => {
                res.end('DATABASE SAVE ISSUE');
            });
        } else {
            res.end('USERNAME ALREADY TAKEN');
        }
    });
}