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
    // Clear the session data or token (example using session, modify as per your authentication method)
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error logging out");
        }

        // Clear the JWT token from client-side (example using cookies, modify according to your setup)
        res.clearCookie("TOKEN"); // Clear the cookie named "TOKEN" where the JWT token is stored

        res.status(200).send("Logout successful");
    });
});

/* Queue up the player with the given name */
let queue = [];
let roomNumber = 1;
router.route('/queue/:name').get((req, res) => {
    let name = req.params.name;
    User.findOne({ username: name })
    .then((user) => {
		queue.push(user);
		res.status(200).send("SUCESS");
    })
	    .catch((err) => {
	     	console.log("Error finding user when queueing");
	        console.log(err);
	     });
});

/* Match players when there are 2 in the queue, return room number */
router.route('/check-queue').get((req, res) => {
    if(queue >= 2){
		queue[0].room = roomNumber;
		queue[1].room = roomNumber;
		queue[0].save().then(() => {
			queue[1].save().then(() => {
				queue.splice(0,2);
				roomNumber++;
				res.status(200).send(''+roomNumber);	// send as String
			})
        })
	}
	else{
		res.status(200).send(''+0);
	}
});

/* Remove player from room and room from User */
router.route('/leave-room/:name').get((req, res) => {
    let name = req.params.name;
    User.findOne({ username: name })
    .then((user) => {
		queue.splice(queue.indexOf(user), 1);
        user.room = 0;
        user.save().then(() => {
    		res.status(200).send(''+roomNumber);	// send as String
        }).catch((err) => { console.log(err); });
    })
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