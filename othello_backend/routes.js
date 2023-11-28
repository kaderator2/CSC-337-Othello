var express = require('express');
const { User } = require("./schemas");
const { addBoardState, boardState, matchState, createMatch } = require("./gameLogic");
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
    let username = req.body.username;
    // find all matches where the user is either player 1 or player 2
    let p = Match.find({ $or: [{ player1Name: username }, { player2Name: username }] }).exec();
    p.then((matches) => {
        res.status(200).send(matches);
    });
});

// Get top ten users based on ranking
router.route("/get-top-ten").get((req, res) => {
    // sort users by rating and get top 10
    let p = User.find().sort({ rating: -1 }).limit(10).exec();
    p.then((users) => {
        res.status(200).send(users);
    });
});

// (this is just a starter endpoint to get the ball rolling)
// Allows user to change their profile photo
router.route("/change-profile-photo").post(auth, (req, res) => {
    // get username and profile photo from request
    let username = req.body.username;
    let profilePhoto = req.body.profilePhoto;
    // find user and update profile photo
    let p = User.findOneAndUpdate({ username: username }, { profilePhoto: profilePhoto }).exec();
    p.then(() => {
        res.status(200).send("Profile photo updated successfully");
    });
});

/* Create and get room number request */
let playerCounter = 0;
let roomNumber = 1;
router.route('/get-room').post((req, res) => {
    console.log("Getting new room number");
    // control of 2-player lobbies
    playerCounter++;
    roomNumber = playerCounter % 3 !== 0 ? roomNumber : roomNumber + 1;

    let name = req.body.username;
    let p = User.find({ username: name }).exec();
    p.then((results) => {
        let user = results[0];
        user.room = roomNumber;
        user.save().then(() => {
            console.log("saved user room successfully");
        }).catch((err) => { console.log(err); });
    })
        .catch((err) => {
            console.log("Error finding user when getting room");
            console.log(err);
        });

    console.log('Joining room ' + roomNumber + ' from server');
    res.status(200).send(roomNumber);
});

/* Request for getting players in a room */
router.route('/room-size/:room').get((req, res) => {
    let roomNumber = req.params.room;
    console.log("getting number of players in room " + roomNumber);
    let p = User.find({ room: roomNumber });
    p.then((users) => {
        res.status(200).send(users.length);
    })
        .catch((err) => {
            console.log("Error getting users in room " + roomNumber);
            console.log(err);
        });
});

/* Match data requests */
router.route('/create-match').get((req, res) => {
    console.log("match creating");
    createMatch(req, res);
});

router.route('/match-state/:match_id').get((req, res) => {
    console.log("checking match state");
    matchState(req, res);
});

router.route('/board-state/:board_id').get((req, res) => {
    console.log("checking board state");
    boardState(req, res);
});

router.route('/add-board-state').post((req, res) => {
    console.log("adding board state");
    addBoardState(req, res);
});

module.exports = router;