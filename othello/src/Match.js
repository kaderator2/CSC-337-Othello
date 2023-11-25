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
  var toPlay = 1;
  
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
  var tempSquares;

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
            squares = structuredClone(currentBoardData.boardState);
            loadGameBoard();
            toPlay = currentBoardData.nextPlayerTurn;
          });
        });
      }, 1000);
    });
    return () => clearInterval(interval);
  }, []);

  function handleClick(row, col) {
    if(toPlay === playerSide) {
      tempSquares = structuredClone(squares);
      if(checkMoveAllowed(row, col)) {
        console.log(tempSquares);
        axios.post('http://localhost:5000/api/add-board-state', {
          match: matchID, 
          board: tempSquares, 
          move: currentBoardData.moveNumber + 1,
          toMove: toPlay === 1 ? 2 : 1
        }).then((boardRes) => {
          //TODO check if game-ending move
        });
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
    let allowed = false;
    if(tempSquares[row][col] === 0) {
      if(tempSquares[row+1] && tempSquares[row+1][col] === oppSide) {
        if (checkMoveOnLine(row, col, 1, 0)) {
          allowed = true;
        }
      }
      if(tempSquares[row-1] && tempSquares[row-1][col] === oppSide) {
        return checkMoveOnLine(row, col, -1, 0);
      }
      if(tempSquares[row][col+1] && tempSquares[row][col+1] === oppSide) {
        if (checkMoveOnLine(row, col, 0, 1)) {
          allowed = true;
        }
      }
      if(tempSquares[row][col-1] && tempSquares[row][col-1] === oppSide) {
        console.log('test3');
        if (checkMoveOnLine(row, col, 0, -1)) {
          console.log('test');
          allowed = true;
        }
      }
      if(tempSquares[row+1] && tempSquares[row+1][col+1] && tempSquares[row+1][col+1] === oppSide) {
        if (checkMoveOnLine(row, col, 1, 1)) {
          allowed = true;
        }
      }
      if(tempSquares[row+1] && tempSquares[row+1][col-1] && tempSquares[row+1][col-1] === oppSide) {
        if (checkMoveOnLine(row, col, 1, -1)) {
          allowed = true;
        }
      }
      if(tempSquares[row-1] && tempSquares[row-1][col-1] && tempSquares[row-1][col-1] === oppSide) {
        if (checkMoveOnLine(row, col, -1, 1)) {
          allowed = true;
        }
      }
      if(tempSquares[row-1] && tempSquares[row-1][col+1] && tempSquares[row-1][col+1] === oppSide) {
        if (checkMoveOnLine(row, col, -1, 1)) {
          allowed = true;
        }
      }
    }
    return allowed;
  }

  //check if line is opposing pieces sandwiched between own pieces
  function checkMoveOnLine(row, col, dirHorizontal, dirVertical) {
    let i = 0;
    let foundOpp = false;
    while(0 <= (row + (i * dirHorizontal)) && (row + (i * dirHorizontal)) < dimension && 0 <= (col + (i * dirVertical)) && (col + (i * dirVertical)) < dimension) {
      if(tempSquares[row + (i * dirHorizontal)][col + (i * dirVertical)] === 0 && i != 0) {
        return false;
      }
      if(tempSquares[row + (i * dirHorizontal)][col + (i * dirVertical)] === oppSide) {
        console.log('test2');
        foundOpp = true;
      }
      else if(tempSquares[row + (i * dirHorizontal)][col + (i * dirVertical)] === playerSide) {
        if(foundOpp === true) {
          captureDownLine(row, col, dirHorizontal, dirVertical);
          return true;
        }
        return false;
      }
      i++;
    }
    return false;
  }

  function captureDownLine(row, col, dirHorizontal, dirVertical) {
    console.log('checking capture');
    let i = 0;
    while(0 <= (row + (i * dirHorizontal)) && (row + (i * dirHorizontal)) < dimension && 0 <= (col + (i * dirVertical)) && (col + (i * dirVertical)) < dimension) {
      console.log('iterating');
      if(tempSquares[row + (i * dirHorizontal)][col + (i * dirVertical)] === playerSide) {
        return;
      }
      tempSquares[row + (i * dirHorizontal)][col + (i * dirVertical)] = playerSide;
      console.log(tempSquares);
      i++;
    }
  }

  const [game, setGame] = useState([]);
  const dimension = 8;

  const loadGameBoard = ()=>{
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