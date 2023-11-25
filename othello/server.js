const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cors = require('cors');

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

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

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
    boardStates: [],
    timestamp: Number
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
    app.post("/api/add/user", (req, res) => {
        console.log("user trying to register1");
        registerNewUser(req, res);
    });

    app.post('/api/login', (req, res) => {
        console.log("user trying to login");
        attemptUserLogin(req, res);
    });

    app.get('/api/check-user-is-logged-in', (req, res) => {
        //TODO set isLoggedIn to false in second case
        if (req.session && req.session.userId) {
            res.status(200).send({ isLoggedIn: true });
        } else {
            res.status(200).send({ isLoggedIn: true });
        }
    });

    /* Match data requests */
    app.get('/api/create-match', (req, res) => {
        console.log("match creating");
        createMatch(req, res);
    });

    app.get('/api/match-state/:match_id', (req, res) => {
        console.log("checking match state");
        matchState(req, res);
    });

    app.get('/api/board-state/:board_id', (req, res) => {
        console.log("checking board state");
        boardState(req, res);
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

const saltRounds = 10;

async function registerNewUser(req, res) {
    try {
        // Check if a user with the given username already exists
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(400).send('A user with this username already exists');
        }

        // Hash the password
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

        res.end("USER CREATED");
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

/* Match functions */
async function createMatch(req, res) {
    try {
        const startingState = [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,2,1,0,0,0],
            [0,0,0,1,2,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0]
        ];

        const startingBoard = new Board({
            moveNumber: 0,
            nextPlayerTurn: 1,
            boardState: startingState
        });
        
        await startingBoard.save();

        //TODO get player names and ratings somehow
        const match = new Match({
            player1Name: 'test',
            player2Name: 'test2',
            player1Rating: 123,
            player2Rating: 345,
            winner: 0,
            boardStates: [startingBoard._id.toString()],
            timestamp: Date.now()
        });

        await match.save();

        res.end(match._id.toString());
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

async function matchState(req, res) {
    try {
        let match = await Match.findOne({ _id: req.params.match_id}).exec();
        if (match) {
            let matchJSON = match.toJSON();
            res.end(JSON.stringify(matchJSON));
        }
        res.end('ERROR');
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

async function boardState(req, res) {
    try {
        let board = await Board.findOne({ _id: req.params.board_id}).exec();
        if (board) {
            console.log(JSON.stringify(board));
            res.end(JSON.stringify(board));
        }
        res.end('ERROR');
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}