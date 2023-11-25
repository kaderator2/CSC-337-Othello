import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {Header, BackButton, PlayerData} from './Components';

const pieces = {
  0: 'Open',
  1: 'Black',
  2: 'White'
};

//TODO assign each player a different color
const playerSide = 1;
const oppSide = playerSide === 1 ? 2 : 1;

function Board() {
  var nextPlayer = 1;
  
  var squares = [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,2,1,0,0,0],
    [0,0,0,1,2,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0]
  ];

  var matchID;
  var matchData;
  var currentBoardData;

  useEffect(()=>{
    var interval;
    axios.get('http://localhost:5000/api/create-match/').then((res) => {
      matchID = res.data;
      interval = setInterval(function () {
        axios.get('http://localhost:5000/api/match-state/' + matchID).then((matchRes) => {
          matchData = matchRes.data;
          let mostRecentBoardID = matchData.boardStates[matchData.boardStates.length - 1];
          axios.get('http://localhost:5000/api/board-state/' + mostRecentBoardID).then((boardRes) => {
            currentBoardData = boardRes.data;
            console.log(boardRes.data);
            squares = structuredClone(currentBoardData.boardState);
            loadGameBoard();
            nextPlayer = currentBoardData.nextPlayerTurn;
          });
        });
      }, 1000);
    });
    return () => clearInterval(interval);
  }, []);

  function handleClick(row, col) {
    if(nextPlayer === playerSide) {
      if(checkMoveAllowed(row, col)) {
        placePiece(row, col);
        console.log(squares);

        //nextPlayer = nextPlayer === 1 ? 2 : 1;
      }

      //TODO if move is legal, create a new board state and put in DB
      //Then switch turn (if in AI mode, go handle that logic)
    }
    /*if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);*/
  }

  //use check to see if the move is allowed (would result in outflank)
  function checkMoveAllowed(row, col) {
    if(squares[row][col] === 0) {
      if(squares[row+1] && squares[row+1][col] === oppSide){
        return checkMoveOnLine(row, col, 1, 0);
      }
      else if(squares[row-1] && squares[row-1][col] === oppSide){
        return checkMoveOnLine(row, col, -1, 0);
      }
      else if(squares[row][col+1] && squares[row][col+1] === oppSide){
        return checkMoveOnLine(row, col, 0, 1);
      }
      else if(squares[row][col-1] && squares[row][col-1] === oppSide){
        return checkMoveOnLine(row, col, 0, -1);
      }
      else if(squares[row+1] && squares[row+1][col+1] && squares[row+1][col+1] === oppSide){
        return checkMoveOnLine(row, col, 1, 1);
      }
      else if(squares[row+1] && squares[row+1][col-1] && squares[row+1][col-1] === oppSide){
        return checkMoveOnLine(row, col, 1, -1);
      }
      else if(squares[row-1] && squares[row-1][col-1] && squares[row-1][col-1] === oppSide){
        return checkMoveOnLine(row, col, -1, 1);
      }
      else if(squares[row-1] && squares[row-1][col+1] && squares[row-1][col+1] === oppSide){
        return checkMoveOnLine(row, col, -1, 1);
      }
    }
    return false;
  }

  //check if line is opposing pieces sandwiched between own pieces
  function checkMoveOnLine(row, col, dirHorizontal, dirVertical) {
    let i = 0;
    let foundOpp = false;
    while(0 <= (row + (i * dirHorizontal)) && (row + (i * dirHorizontal)) < 8 && 0 <= (col + (i * dirVertical)) && (col + (i * dirVertical)) < 8) {
      if(squares[row + (i * dirHorizontal)][col + (i * dirVertical)] === oppSide) {
        foundOpp = true;
      }
      else if(squares[row + (i * dirHorizontal)][col + (i * dirVertical)] === playerSide) {
        if(foundOpp === true) {
          return true;
        }
        return false;
      }
      i++;
    }
    return false;
  }

  function placePiece(row, col) {
    squares[row][col] = playerSide;

    if(squares[row+1] && squares[row+1][col] === oppSide){
      handleCaptureDownLine(row, col, 1, 0);
    }
    if(squares[row-1] && squares[row-1][col] === oppSide){
      handleCaptureDownLine(row, col, -1, 0);
    }
    if(squares[row][col+1] && squares[row][col+1] === oppSide){
      handleCaptureDownLine(row, col, 0, 1);
    }
    if(squares[row][col-1] && squares[row][col-1] === oppSide){
      handleCaptureDownLine(row, col, 0, -1);
    }
    if(squares[row+1] && squares[row+1][col+1] && squares[row+1][col+1] === oppSide){
      handleCaptureDownLine(row, col, 1, 1);
    }
    if(squares[row+1] && squares[row+1][col-1] && squares[row+1][col-1] === oppSide){
      handleCaptureDownLine(row, col, 1, -1);
    }
    if(squares[row-1] && squares[row-1][col-1] && squares[row-1][col-1] === oppSide){
      handleCaptureDownLine(row, col, -1, 1);
    }
    if(squares[row-1] && squares[row-1][col+1] && squares[row-1][col+1] === oppSide){
      handleCaptureDownLine(row, col, -1, 1);
    }
  }

  function handleCaptureDownLine(row, col, dirHorizontal, dirVertical) {
    let i = 0;
    while(squares[row + (i * dirHorizontal)][col + (i * dirVertical)] !== undefined) {
      squares[row + (i * dirHorizontal)][col + (i * dirVertical)] = playerSide;

      if(squares[row + (i * dirHorizontal)][col + (i * dirVertical)] === playerSide) {
        return;
      }
      i++;
    }
  }

  const [game, setGame] = useState([]);
  const dimension = 8;

  const loadGameBoard = ()=>{
    console.log(squares);
    let arr = [];

    for (let i=0;i<dimension;i++){
      let temp = [];
      for (let j=0;j<dimension;j++){
          temp.push(<div id={i.toString() + j.toString()} className='board_square' onClick={() => handleClick(i,j)}>
            <p>{pieces[squares[i][j]]}</p>
          </div>);
      }
      arr.push(temp);
    }

    setGame(arr);
  }

  useEffect(()=>{
    loadGameBoard();
  },[]);

  return (
    <div className='board'>
      <section className='board_box'>
        {game}
      </section>

    </div>
  );
}

/*function testBoard({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <div>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </div>
  );
}*/

function Match({mode}) {

  /*function handlePlay(nextSquares) {
      const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
      setHistory(nextHistory);
      setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
      setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
      let description;
      if (move > 0) {
      description = 'Go to move #' + move;
      } else {
      description = 'Go to game start';
      }
      return (
      <li key={move}>
          <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
      );
  });*/

  return (
      <div>
        <BackButton />
        <Header value='Match' />
        <div className='match_container centered_container'>
          <div className='game_container centered_section'>
            <PlayerData id='top_player' name='test' rating='1400' />
            <PlayerData id='bottom_player' name='test2' rating='1450' />
            <div className="game">
              <Board />
            </div>
          </div>
        </div>
      </div>
  );
}

export default Match;

/*function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}*/