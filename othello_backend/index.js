/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * This file initializes the database connection, sets up CORS, and sets up sessions, along with a
 * few other tasks.
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

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
app.use(cors({ origin: true, credentials: true }));

app.listen(port, () => console.log('App listening on port ' + port));
const routes = require("./routes");
mongoose.connect(mongoDBURL, { useNewUrlParser: true });
app.use('/api/', routes);