/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * This file creates routes for requests to the server. These include requests to handle accounts,
 * matchmaking, gameplay data, and other functionality.
 */

var express = require('express');
const { User, Match } = require("./schemas");
const { addBoardState, boardState, matchState, createMatch, updateWinner, updateRating } = require("./gameLogic");
const auth = require("./auth");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

var router = express.Router();

// Receives the request to add a user to the database
router.route("/add/user").post(async (req, res) => {
    try {
        // Check if the username or password is empty
        if (req.body.username === "" || req.body.password === "") {
            return res.status(400).send({
                message: "Username or password cannot be empty",
            });
        }
        // Check if a user with the given username already exists
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(400).send({
                message: "User already exists",
            });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        // Create a new user with the hashed password
        const user = new User({
            username: req.body.username,
            password: hashedPassword,
            rating: req.body.rating,
            room: 0,
            matches: req.body.matches
        });

        // Save the user to the database
        await user.save();
        res.status(201).send({
            message: "User created successfully",
        });
    } catch (error) {
        // If there is an error, send a 500 error code
        console.log(error);
        res.status(500).send({
            message: "Error creating user",
            error,
        });
    }
});

// login endpoint
router.route("/login").post((req, res) => {
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
                            message: "Invalid Username or Password",
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
                        message: "Invalid Username or Password",
                        error,
                    });
                });
        })
        // catch error if user does not exist
        .catch((error) => {
            res.status(404).send({
                message: "User not found",
                error,
            });
        });
});

// free endpoint
router.get("/free-endpoint", (request, response) => {
    response.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
router.route("/auth-endpoint").get(auth, (request, response) => {
    response.json({ message: "You are authorized to access me" });
});

// Logout endpoint
router.route("/logout").get((req, res) => {
    console.log("Logging out");
    // Clear the session data or token
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error logging out");
        }

        // Clear the JWT token from client-side
        res.clearCookie("TOKEN"); // Clear the cookie named "TOKEN" where the JWT token is stored

        res.status(200).send("Logout successful");
    });
});

// Get user match history from endpoint
router.route("/get-match-history").get((req, res) => {
    // get username from request
    let username = req.query.username;
    // find all matches where the user is either player 1 or player 2
    //let p = Match.find({ $or: [{ player1Name: username }, { player2Name: username }] }).exec();
    let p = Match.find( { player1Name: username } ).exec();
    p.then((matches) => {
        if (matches) {
            console.log(matches);
            res.status(200).send(JSON.stringify(matches));
        }
        res.end('ERROR');
    });
});

// Get top ten users based on ranking
router.route("/get-top-ten").get((req, res) => {
    // sort users by rating and get top 10, projecting only necessary fields
    let p = User.find().sort({ rating: -1 }).limit(10).select('-password').exec();
    p.then((users) => {
        res.status(200).send(users);
    });
});

// Get user data by username
router.route("/get-user-data").get((req, res) => {
    let p = User.findOne({ username: req.query.name }).exec();
    p.then((user) => {
        console.log(user);
        res.status(200).send(user);
    })
        .catch((err) => { console.log(err); });
});



/* Queue up the player with the given name */
let queue = [];
let roomNumber = 1;
router.route('/queue/:name').get((req, res) => {
    let name = req.query.name;
    User.findOne({ username: name })
        .then((user) => {
            queue.push(user);
            res.status(200).send("SUCESS");
        })
});

/* Match players when there are 2 in the queue, return room number
   of the player passed in as a parameter */
router.route('/check-queue/:name').get((req, res) => {
    let name = req.params.name;
    //console.log("Q length: " + queue.length);
    if (queue.length >= 2) {
        queue[0].room = roomNumber;
        queue[1].room = roomNumber;
        queue[0].save().then(() => {
            queue[1].save().then(() => {
                queue.splice(0, 2);
                roomNumber++;
            }).catch((err) => { console.log(err); });
        }).catch((err) => { console.log(err); });
    }
    User.findOne({ username: name })
        .then((user) => {
            res.status(200).send('' + (user.room));	// send as String
        });
});

/* Remove player from room and room from User */
router.route('/leave-room/:name').get((req, res) => {
    let name = req.params.name;
    User.findOne({ username: name })
        .then((user) => {
            queue.splice(queue.indexOf(user), 1);
            user.room = 0;
            user.save().then(() => {
                res.status(200).send('' + roomNumber);	// send as String
            }).catch((err) => { console.log(err); });
        })
});


/* Endpoint to return user statistics */
router.route('/get-user-stats/:name').get(async (req, res) => {
    const name = req.params.name;
    console.log(name);

    try {
        const user = await User.findOne({ username: name });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const matchesPlayed = await Match.find({
            //$or: [{ player1Name: name }, { player2Name: name }],
            player1Name: name
        });

        const totalGamesPlayed = matchesPlayed.length;
        const gamesWon = matchesPlayed.filter(
            (match) => match.winner === name
        ).length;

        let lastGamePlayed = 'No games played yet';
        if (totalGamesPlayed > 0) {
            const lastMatch = matchesPlayed[totalGamesPlayed - 1];
            lastGamePlayed = lastMatch ? lastMatch._id : lastGamePlayed;
        }

        const winPercentage =
            totalGamesPlayed > 0 ? ((gamesWon / totalGamesPlayed) * 100).toFixed(2) : 0;

        const userStats = {
            lastGamePlayed,
            totalGamesPlayed,
            gamesWon,
            winPercentage,
        };

        res.status(200).json(userStats);
    } catch (error) {
        console.error('Error retrieving user stats:', error);
        res.status(500).json({ message: 'Error retrieving user stats', error });
    }
});


/* Match data requests */
router.route('/create-match').get((req, res) => {
    console.log("match creating");
    createMatch(req, res);
});

/* Retrieves match state from ID */
router.route('/match-state/:match_id').get((req, res) => {
    console.log("checking match state");
    matchState(req, res);
});

/* Retrieves board state from ID */
router.route('/board-state/:board_id').get((req, res) => {
    console.log("checking board state");
    boardState(req, res);
});

/* Adds board state to a match with a specific ID */
router.route('/add-board-state').post((req, res) => {
    console.log("adding board state");
    addBoardState(req, res);
});

/* Updates the winner for a match with a specific ID */
router.route('/update-winner').post((req, res) => {
    console.log("updating winner");
    updateWinner(req, res);
});

/* /* Updates the rating for a player with a specific ID */
router.route("/change-user-rating").post((req, res) => {
    console.log('updating rating');
    updateRating(req, res);
});

module.exports = router;