/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * This file contains the logic for the game. It is responsible for creating new matches, adding
 * board states to matches, getting board states from matches, and otherwise updating match
 * data.
 */

const {User, Match, Board} = require('./schemas.js');

/*
This function creates a new match in the database, and returns the ID of the match as a string.

req - an object representing an HTTP request.
res - an object representing the response to an HTTP request.
*/
async function createMatch(req, res) {
    try {
        //Set up initial board array
        const startingState = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 2, 1, 0, 0, 0],
            [0, 0, 0, 1, 2, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];

        //Create initial board
        const startingBoard = new Board({
            moveNumber: 0,
            nextPlayerTurn: 1,
            boardState: startingState
        });

        await startingBoard.save();

        //Create match
        const match = new Match({
            player1Name: req.query.p1Username,
            player2Name: req.query.p2Username,
            player1Rating: req.query.p1Rating,
            player2Rating: req.query.p2Rating,
            winner: 'None',
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

/*
This function gets a match by ID, and returns its current data.

req - an object representing an HTTP request.
res - an object representing the response to an HTTP request.
*/
async function matchState(req, res) {
    try {
        let match = await Match.findOne({ _id: req.params.match_id }).exec();
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

/*
This function gets a board by ID, and returns its current data

req - an object representing an HTTP request.
res - an object representing the response to an HTTP request.
*/
async function boardState(req, res) {
    try {
        let board = await Board.findOne({ _id: req.params.board_id }).exec();
        if (board) {
            res.end(JSON.stringify(board));
        }
        res.end('ERROR');
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

/*
This function creates a new board with data found in the request, and adds it to the provided match
by ID. Both are then saved.

req - an object representing an HTTP request.
res - an object representing the response to an HTTP request.
*/
async function addBoardState(req, res) {
    try {
        var match = await Match.findOne({ _id: req.body.match }).exec();

        const newBoard = new Board({
            moveNumber: req.body.move,
            nextPlayerTurn: req.body.toMove,
            boardState: req.body.board
        });

        await newBoard.save();

        match.boardStates.push(newBoard._id.toString());
        match.markModified('boardStates');
        await match.save();

        console.log("board added\n", newBoard.boardState);
        res.end('BOARD ADD SUCCESS');
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

/*
This function gets a match by ID, updates the winner, and saves it.

req - an object representing an HTTP request.
res - an object representing the response to an HTTP request.
*/
async function updateWinner(req, res) {
    try {
        var match = await Match.findOne({ _id: req.body.matchID }).exec();

        match.winner = req.body.winner;
        match.markModified('winner');
        await match.save();
        console.log("winner updated");
        res.end('WINNER UPDATE SUCCESS');
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

/*
This function gets a player by name, updates their rating, and saves it.

req - an object representing an HTTP request.
res - an object representing the response to an HTTP request.
*/
async function updateRating(req, res) {
    try {
        var user = await User.findOne({ username: req.body.username }).exec();

        user.rating = req.body.rating;
        user.markModified('rating');
        await user.save();
        console.log(req.body.username);
        console.log(req.body.rating);
        console.log("rating updated");
        res.end('RATING UPDATE SUCCESS');
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

module.exports = { addBoardState, boardState, matchState, createMatch, updateWinner, updateRating };