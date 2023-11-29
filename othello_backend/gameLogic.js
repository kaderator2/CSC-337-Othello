/**
 * This file contains the logic for the game.
 * It is responsible for creating new matches, adding board states to matches, and getting board states from matches.
 */
const { User, Board, Match } = require("./schemas");
async function createMatch(req, res) {
    try {
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

        const startingBoard = new Board({
            moveNumber: 0,
            nextPlayerTurn: 1,
            boardState: startingState
        });

        await startingBoard.save();

        //TODO get player names and ratings somehow
        const match = new Match({
            player1Name: req.body.p1Username,
            player2Name: req.body.p2Username,
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

module.exports = { addBoardState, boardState, matchState, createMatch };