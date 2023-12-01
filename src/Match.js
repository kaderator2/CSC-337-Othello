import React from 'react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Header, BackButton, PlayerData, getUsername, socket } from './Components';
import { BackButtonLobby, room } from './Lobby';

var getUser;
const pieces = {
  0: 'open',
  1: 'black',
  2: 'white'
};

//TODO assign each player a different color
var playerSide;
const oppSide = playerSide === 1 ? 2 : 1;
var oppName = '';

socket.on("found_match", (res) => {
	getUser = getUsername();
    let allPlayers = res.allPlayers;
    let foundObj = allPlayers.find(obj => obj.p1.player === getUser || obj.p2.player === getUser);
    foundObj.p1.player === getUser ? oppName = foundObj.p2.player : oppName = foundObj.p1.player;
    foundObj.p1.player === getUser ? playerSide = 1 : playerSide = 2;
    //foundObj.p1.player === getUser ? color = foundObj.p1.color : color = foundObj.p2.color;
    console.log("User: " + getUser);
    console.log("Opp: " + oppName);
});

function Board({ mode }) {
  var toPlay = 1;
  var move = 1;

  const userRef = useRef({
    data: {
      rating: '?'
    }
  });
  const oppRef = useRef({
    data: {
      rating: '?'
    }
  });

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
    if (mode === 'AI') {
      oppName = 'AI';
      playerSide = 1;
    }

    //Get data for the current user
    axios.get('http://localhost:5000/api/get-user-data', {
      params: {
		name: getUsername()
      }
    }).then((user) => {
      userRef.current = user;
      let p = getOppData();
      p.then((opp) => {
        oppRef.current = opp;
        //Create the match
        axios.get('http://localhost:5000/api/create-match/', {
          params: {
            p1Username: getUsername(),
            p2Username: oppName,
            p1Rating: user.data.rating,
            p2Rating: opp.data.rating
          }
        }).then((res) => {
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
      });
    });
    return () => clearInterval(interval);
  }, []);

  async function getOppData () {
	var opp;
    if (oppName === 'AI') {
      opp = {
        data: {
          username: 'AI',
          rating: 800
        }
      }
	  return opp;
    }
    else {
	  return new Promise((resolve, reject) => {
	  	axios.get('http://localhost:5000/api/get-user-data', {
        params: {
          name: oppName
        }
	    }).then((user) => {
	        opp = user;
		    return resolve(opp);
	    });
	 });
    }
  }

  function handleClick(row, col) {
	console.log("toPlay: " + toPlay + " playerSide: " + playerSide);
    if (toPlay === playerSide) {
      tempSquares = structuredClone(squares);
      if (checkMoveAllowed(row, col, true)) {
        axios.post('http://localhost:5000/api/add-board-state', {
          match: matchID,
          board: tempSquares,
          move: move + 1,
          toMove: toPlay === 1 ? 2 : 1
        }).then((boardRes) => {
		  socket.emit("player_move", {name:getUser, room:room, row:row, col:col});
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
              console.log("waiting for opponent move");
              // TODO implement timer
            }
          }
        });
      }
    }
  }
  
  socket.on('opp_move', (res) => {
	if (toPlay !== playerSide) {  
		setTimeout(() => {  
			tempSquares = structuredClone(squares);
		    if (checkMoveAllowed(res.row, res.col, true)){
				if(currentBoardData){
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
			    }
		    }
	    }, 1000);
    }
  });

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

  //result should be 1 for a win, 0.5 for a draw, and 0 for a loss
  function updateUserRating(result) {
    var expected = 1/(1+Math.pow(10, (oppRef.current.data.rating - userRef.current.data.rating) / 400));
    var newRating = Math.round(userRef.current.data.rating + 32 * (result - expected));
    axios.post('http://localhost:5000/api/change-user-rating', {
      username: getUsername(),
      rating: newRating
    });
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
    // TODO: user wins on opponent disconnect
    if (p1Score === p2Score) {
      axios.post('http://localhost:5000/api/update-winner', {
        winner: 'DRAW',
        matchID: matchID
      });
      updateUserRating(0.5);
      alert('DRAW');
    }
    else if (p1Score > p2Score) {
      if(playerSide === 1) {
        axios.post('http://localhost:5000/api/update-winner', {
          winner: getUsername(),
          matchID: matchID
        });
        updateUserRating(1);
      }
      else {
        axios.post('http://localhost:5000/api/update-winner', {
          winner: oppName,
          matchID: matchID
        });
        updateUserRating(0);
      }
      alert('BLACK WINS');
    }
    else {
      if(playerSide === 2) {
        axios.post('http://localhost:5000/api/update-winner', {
          winner: oppName,
          matchID: matchID
        });
        updateUserRating(1);
      }
      else {
        axios.post('http://localhost:5000/api/update-winner', {
          winner: getUsername(),
          matchID: matchID
        });
        updateUserRating(0);
      }
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
    <div className='match_container centered_container'>
        <div className='game_container centered_section'>
          <PlayerData id='top_player' name={oppName} rating={oppRef.current.data.rating} />
          <PlayerData id='bottom_player' name={getUsername()} rating={userRef.current.data.rating} />
          <div className="game">
            <div className='board'>
              <section className='board_box'>
                {game}
              </section>

            </div>
          </div>
        </div>
      </div>
    
  );
}

function Match({ mode }) {
  return (
    <div>
      <BackButtonLobby from="Match"/>
      <Header value='Match' />
      <Board mode={mode} />
    </div>
  );
}

export default Match;