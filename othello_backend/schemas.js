/**
 * Specifies the required schemas for the database, items and users.
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
    winner: Number,
    boardStates: []
});

const UserSchema = new Schema({
    username: String,
    password: String,
    rating: Number,
    room: Number,
    //profilePhoto:
    //{
    //    data: Buffer,
    //    contentType: String
    //},
    matches: []
});

var Board = mongoose.model('Board', BoardSchema);
var Match = mongoose.model('Match', MatchSchema);
var User = mongoose.model('User', UserSchema);

module.exports = { User, Match, Board };