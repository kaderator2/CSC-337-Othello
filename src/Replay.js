/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * This file contains the replay page for the frontend. This page is used to
 * replay a match that has already been played.
 */

import React from 'react';
import { useState, useEffect } from 'react';
import Default, { Header, BackButton, PlayerData } from './Components'
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const pieces = {
    0: 'open',
    1: 'black',
    2: 'white'
};

// default board
var boards = [[
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
]];

var move = 0;

/*
This component is used to render the replay board.
matchData: The data for the match to replay
*/
function ReplayBoard({ matchData }) {
    useEffect(() => {
        move = 0;
    }, []);

    const [board, setBoard] = useState([]);
    const dimension = 8;

    // loads the board
    const loadGameBoard = () => {
        let arr = [];
        for (let i = 0; i < dimension; i++) {
            let temp = [];
            for (let j = 0; j < dimension; j++) {
                console.log(move);
                console.log(boards);
                temp.push(<div id={i.toString() + j.toString()} className='board_square'>
                    <div className={'piece ' + pieces[boards[move][i][j]]}></div>
                </div>);
            }
            // add the row to the board
            arr.push(temp);
        }
        // set the board
        setBoard(arr);
    }

    useEffect(() => {
        boardStatesToArray(matchData).then(() => {
            loadGameBoard();
        });
    }, []);

    // moves the board forward one move
    const moveForward = () => {
        if (move < boards.length - 1) {
            move++;
            loadGameBoard();
        }
    }

    // moves the board back one move
    const moveBack = () => {
        if (move > 0) {
            move--;
            loadGameBoard();
        }
    }

    /*
    This function is used to compare two board states.

    a: The first board state
    b: The second board state
    */
    function compareBoardStates(a, b) {
        if (a.moveNumber < b.moveNumber)
            return -1;
        if (a.moveNumber > b.moveNumber)
            return 1;
        return 0;
    }

    /*
    This function is used to convert the board states to an array.

    matchData: The data for the match to replay
    */
    async function boardStatesToArray(matchData) {
        let tempBoards = [[
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 2, 1, 0, 0, 0],
            [0, 0, 0, 1, 2, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ]];

        // get the board states
        for (let i = 0; i < matchData.boardStates.length; i++) {
            axios.get('http://localhost:5000/api/board-state/' + matchData.boardStates[i]).then((boardRes) => {
                if (i > 0) {
                    // add the board state to the array
                    boards.push(boardRes.data.boardState);
                    boards.sort(compareBoardStates);
                }
            });
        }
        boards = tempBoards;
    }

    return (
        <div className='match_container centered_container'>
            <div className='game_container centered_section'>
                <PlayerData id='top_player' name={matchData.player1Name} rating={matchData.player1Rating} />
                <PlayerData id='bottom_player' name={matchData.player2Name} rating={matchData.player2Rating} />
                <div className='board'>
                    <section className='board_box'>
                        {board}
                    </section>
                </div>
            </div>
            <div id='replay_forward' className='arrow_container' onClick={moveForward}>
                <img src={require('./images/arrow_right.png')} alt='A forward arrow symbol'
                    className='image_contain' width='50' />
            </div>
            <div id='replay_back' className='arrow_container' onClick={moveBack}>
                <img src={require('./images/arrow_left.png')} alt='A back arrow symbol'
                    className='image_contain' width='50' />
            </div>
        </div>
    );
}

/*
This component is used to render the replay page.
*/
function Replay() {
    const location = useLocation();

    var matchData = location.state.matchData;

    return (
        <div>
            <BackButton />
            <Header value='Replay' />
            <ReplayBoard matchData={matchData} />
        </div>
    );
}

export default Replay;