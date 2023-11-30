import React from 'react';
import { useState, useEffect } from 'react';
import Default, {Header, BackButton, PlayerData} from './Components'
import {useLocation} from 'react-router-dom';
import axios from 'axios';

const pieces = {
    0: 'open',
    1: 'black',
    2: 'white'
  };

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
function ReplayBoard({ matchData }) {
    useEffect(() => {
        move = 0;
    }, []);

    const [board, setBoard] = useState([]);
    const dimension = 8;

    const loadGameBoard = () => {
        let arr = [];
        for (let i = 0; i < dimension; i++) {
        let temp = [];
        for (let j = 0; j < dimension; j++) {
            temp.push(<div id={i.toString() + j.toString()} className='board_square'>
            <div className={'piece ' + pieces[boards[move][i][j]]}></div>
            </div>);
        }
        arr.push(temp);
        }

        setBoard(arr);
    }

    useEffect(() => {
        boardStatesToArray(matchData).then(() => {
            loadGameBoard();
        });
    }, []);

    const moveForward = () => {
        if (move < boards.length - 1) {
            move++;
            loadGameBoard();
        }
    }

    const moveBack = () => {
        if (move > 0) {
            move--;
            loadGameBoard();
        }
    }

    async function boardStatesToArray(matchData) {
        for(let i = 0; i < matchData.boardStates.length; i++) {
            axios.get('http://localhost:5000/api/board-state/' + matchData.boardStates[i]).then((boardRes) => {
                if (i > 0) {
                    boards.push(boardRes.data.boardState);
                }
            });
        }
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