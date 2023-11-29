import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, BackButton, PlayerData } from './Components';

const pieces = {
  0: 'open',
  1: 'black',
  2: 'white'
};

//TODO assign each player a different color
const playerSide = 1;
const oppSide = playerSide === 1 ? 2 : 1;

function Board({ mode }) {
  var toPlay = 1;
  var move = 1;

  var squares = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var tempSquares;

  var matchID;
  var matchData;
  var currentBoardData;

  useEffect(() => {
    var interval;
    axios.get('http://localhost:5000/api/create-match/').then((res) => {
      matchID = res.data;
      interval = setInterval(function () {
        axios.get('http://localhost:5000/api/match-state/' + matchID).then((matchRes) => {
          matchData = matchRes.data;
          let mostRecentBoardID = matchData.boardStates[matchData.boardStates.length - 1];
          axios.get('http://localhost:5000/api/board-state/' + mostRecentBoardID).then((boardRes) => {
            currentBoardData = boardRes.data;
            squares = currentBoardData.boardState;
            loadGameBoard();
            toPlay = currentBoardData.nextPlayerTurn;
            move = currentBoardData.moveNumber;
          });
        });
      }, 500);
    });
    return () => clearInterval(interval);
  }, []);

  function handleClick(row, col) {
    if (toPlay === playerSide) {
      tempSquares = structuredClone(squares);
      if (checkMoveAllowed(row, col, true)) {
        axios.post('http://localhost:5000/api/add-board-state', {
          match: matchID,
          board: tempSquares,
          move: move + 1,
          toMove: toPlay === 1 ? 2 : 1
        }).then((boardRes) => {
          toPlay = toPlay === 1 ? 2 : 1;
          if (checkGameEnd()) {
            endGame();
          }
          else {
            if (mode === 'AI') {
              setTimeout(() => {
                computerTurn();
                axios.post('http://localhost:5000/api/add-board-state', {
                  match: matchID,
                  board: tempSquares,
                  move: currentBoardData.moveNumber + 1,
                  toMove: toPlay === 1 ? 2 : 1
                }).then((boardRes) => {
                  toPlay = toPlay === 1 ? 2 : 1;
                  if (checkGameEnd()) {
                    endGame();
                  }
                });
              }, 1000);
            }
            else if (mode === 'PVP') {
              //TODO handle multiplayer stuff
            }
          }
        });
      }
    }
  }

  function computerTurn() {
    let allowedSpaces = [];
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        if (checkMoveAllowed(i, j, false)) {
          allowedSpaces.push([i, j]);
        }
      }
    }
    let space = allowedSpaces[Math.floor(Math.random() * allowedSpaces.length)];
    checkMoveAllowed(space[0], space[1], true);
  }

  //Check if no more moves can be played. If this is the case, end the game and tally the score.
  function checkGameEnd() {
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        if (checkMoveAllowed(i, j, false)) {
          return false;
        }
      }
    }
    return true;
  }

  //Tally points and determine a winner
  function endGame() {
    let p1Score = 0;
    let p2Score = 0;
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        if (tempSquares[i][j] === 1) {
          p1Score += 1;
        }
        else if (tempSquares[i][j] === 2) {
          p2Score += 1;
        }
      }
    }

    //TODO handle pop up or other menu on winning
    // TODO: disconnect from socket room
    if (p1Score === p2Score) {
      alert('DRAW');
    }
    else if (p1Score > p2Score) {
      alert('BLACK WINS');
    }
    else {
      alert('WHITE WINS');
    }
  }
  //use check to see if the move is allowed (would result in outflank)
  function checkMoveAllowed(row, col, attemptMove) {
    let allowed = false;
    if (tempSquares[row][col] === 0) {
      if (checkMoveOnLine(row, col, 1, 0, attemptMove)) {
        allowed = true;
      }
      if (checkMoveOnLine(row, col, -1, 0, attemptMove)) {
        allowed = true;
      }
      if (checkMoveOnLine(row, col, 0, 1, attemptMove)) {
        allowed = true;
      }
      if (checkMoveOnLine(row, col, 0, -1, attemptMove)) {
        allowed = true;
      }
      if (checkMoveOnLine(row, col, 1, 1, attemptMove)) {
        allowed = true;
      }
      if (checkMoveOnLine(row, col, 1, -1, attemptMove)) {
        allowed = true;
      }
      if (checkMoveOnLine(row, col, -1, 1, attemptMove)) {
        allowed = true;
      }
      if (checkMoveOnLine(row, col, -1, -1, attemptMove)) {
        allowed = true;
      }
    }
    return allowed;
  }

  //check if line is opposing pieces sandwiched between own pieces
  function checkMoveOnLine(row, col, dirHorizontal, dirVertical, attemptMove) {
    let i = 0;
    let foundOpp = false;
    while (0 <= (row + (i * dirHorizontal)) && (row + (i * dirHorizontal)) < dimension && 0 <= (col + (i * dirVertical)) && (col + (i * dirVertical)) < dimension) {
      if (tempSquares[row + (i * dirHorizontal)][col + (i * dirVertical)] === 0 && i != 0) {
        return false;
      }
      if (tempSquares[row + (i * dirHorizontal)][col + (i * dirVertical)] === (toPlay === 1 ? 2 : 1)) {
        foundOpp = true;
      }
      else if (tempSquares[row + (i * dirHorizontal)][col + (i * dirVertical)] === toPlay && i != 0) {
        if (foundOpp === true) {
          if (attemptMove) {
            captureDownLine(row, col, dirHorizontal, dirVertical);
          }
          return true;
        }
        return false;
      }
      i++;
    }
    return false;
  }

  function captureDownLine(row, col, dirHorizontal, dirVertical) {
    let i = 0;
    while (0 <= (row + (i * dirHorizontal)) && (row + (i * dirHorizontal)) < dimension && 0 <= (col + (i * dirVertical)) && (col + (i * dirVertical)) < dimension) {
      if (tempSquares[row + (i * dirHorizontal)][col + (i * dirVertical)] === toPlay && i != 0) {
        return;
      }
      tempSquares[row + (i * dirHorizontal)][col + (i * dirVertical)] = toPlay;
      i++;
    }
  }

  const [game, setGame] = useState([]);
  const dimension = 8;

  const loadGameBoard = () => {
    let arr = [];

    for (let i = 0; i < dimension; i++) {
      let temp = [];
      for (let j = 0; j < dimension; j++) {
        temp.push(<div id={i.toString() + j.toString()} className='board_square' onClick={() => handleClick(i, j)}>
          <div className={'piece ' + pieces[squares[i][j]]}></div>
        </div>);
      }
      arr.push(temp);
    }

    setGame(arr);
  }

  useEffect(() => {
    loadGameBoard();
  }, []);

  return (
    <div className='board'>
      <section className='board_box'>
        {game}
      </section>

    </div>
  );
}

function Match({ mode }) {
  return (
    <div>
      <BackButton />
      <Header value='Match' />
      <div className='match_container centered_container'>
        <div className='game_container centered_section'>
          <PlayerData id='top_player' name='test' rating='1400' />
          <PlayerData id='bottom_player' name='test2' rating='1450' />
          <div className="game">
            <Board mode={mode} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Match;