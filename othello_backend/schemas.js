/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * This file specifies the required schemas for the database, items and users.
 */

const mongoose = require('mongoose');

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
    winner: String,
    boardStates: []
});

const UserSchema = new Schema({
    username: String,
    password: String,
    rating: Number,
    room: Number,
});

var Board = mongoose.model('Board', BoardSchema);
var Match = mongoose.model('Match', MatchSchema);
var User = mongoose.model('User', UserSchema);

module.exports = { User, Match, Board };