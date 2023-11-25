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
      //TODO switch turn logic (if in AI mode, go handle that logic)
    }
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

function Match({mode}) {
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