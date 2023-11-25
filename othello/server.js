const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cors = require('cors');
const auth = require("./auth");

const app = express();

// Set up DB
const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1:27017/connect_mongodb_session_test';
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Define port
const port = process.env.PORT || 5000;
const store = new MongoDBStore({
    uri: mongoDBURL,
    collection: 'mySessions'
});

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
});

app.use(session({
    secret: 'your secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 // cookie will expire in 1 day
    }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * Specifies the required schemas for the database, items and users.
 */
const Schema = mongoose.Schema;
const BoardSchema = new Schema({
    moveNumber: Number,
    nextPlayerTurn: Number,
    boardState: [[]]
});

const MatchSchema = new Schema({
    player1Name: String,
    player2Name: String,
    player1Rating: Number,
    player2Rating: Number,
    winner: Number,
    boardStates: []
});

const UserSchema = new Schema({
    username: String,
    password: String,
    rating: Number,
    matches: []
});

var Board = mongoose.model('Board', BoardSchema);
var Match = mongoose.model('Match', MatchSchema);
var User = mongoose.model('User', UserSchema);

mongoose.connect(mongoDBURL, {
    useNewUrlParser: true
}).then(() => {
    // Receives the request to add a user to the database
    app.post("/api/add/user", async (req, res) => {
        try {
            // Check if a user with the given username already exists
            const existingUser = await User.findOne({ username: req.body.username });
            if (existingUser) {
                return res.status(400).send('A user with that username already exists');
            }

            // Hash the password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

            // Create a new user with the hashed password
            const user = new User({
                username: req.body.username,
                password: hashedPassword,
                rating: req.body.rating,
                matches: req.body.matches
            });

            // Save the user to the database
            await user.save();
            res.status(201).send("User created successfully");
        } catch (error) {
            // If there is an error, send a 500 error code
            console.log(error);
            res.status(500).send("Error creating user");
        }
    });


    // login endpoint
    app.post("/api/login", (req, res) => {
        let userData = req.body;
        // check if user exists
        User.findOne({ username: userData.username })

            // if user exists
            .then((user) => {
                // compare the password entered and the hashed password found
                bcrypt
                    .compare(userData.password, user.password)

                    // if the passwords match
                    .then((passwordCheck) => {

                        // check if password matches
                        if (!passwordCheck) {
                            return res.status(400).send({
                                message: "Passwords does not match",
                                error,
                            });
                        }

                        // create JWT token
                        const token = jwt.sign(
                            {
                                userId: user._id,
                                username: userData.username,
                            },
                            "RANDOM-TOKEN",
                            { expiresIn: "24h" }
                        );

                        // return success response
                        res.status(200).send({
                            message: "Login Successful",
                            username: userData.username,
                            token,
                        });
                    })
                    // catch error if password does not match
                    .catch((error) => {
                        res.status(400).send({
                            message: "Passwords do not match",
                            error,
                        });
                    });
            })
            // catch error if user does not exist
            .catch((e) => {
                res.status(404).send({
                    message: "User not found",
                    e,
                });
            });
    });

    // free endpoint
    app.get("/api/free-endpoint", (request, response) => {
        response.json({ message: "You are free to access me anytime" });
    });

    // authentication endpoint
    app.get("/api/auth-endpoint", auth, (request, response) => {
        response.json({ message: "You are authorized to access me" });
    });

    app.get('/api/check-user-is-logged-in', (req, res) => {
        //TODO set isLoggedIn to false in second case
        if (req.session && req.session.userId) {
            res.status(200).send({ isLoggedIn: true });
        } else {
            res.status(200).send({ isLoggedIn: true });
        }
    });

    // The "catchall" handler: for any request that doesn't
    // match one above, send back React's index.html file.
    app.get('*', (req, res) => {
        res.sendFile('public/index.html');
    });

    app.listen(port, () =>
        console.log(`App listening at port ${port}`));
});

async function attemptUserLogin(req, res) {
    let userData = req.body;
    try {
        const user = await User.findOne({ username: userData.username });
        if (!user) {
            return res.status(404).send();
        }

        bcrypt.compare(userData.password, user.password, function (err, isMatch) {
            if (isMatch && !err) {
                // Create a session for the user
                req.session.userId = user._id;
                return res.status(200).send({ redirectURL: '/home' });
            } else {
                return res.status(401).send('Cant find user');
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send('Error logging in');
    }
}


async function registerNewUser(req, res) {

}