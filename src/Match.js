/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * This file manages the match page of the site, managing gameplay and sending and recieving
 * necessary data from the server.
 */

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Header, PlayerData, getUsername, socket } from './Components';
import { room } from './Lobby';
import { useNavigate } from "react-router-dom";

var gameOver = false;
var getUser;
var matchID;
var userRef;
var oppRef;
const pieces = {
  0: 'open',
  1: 'black',
  2: 'white'
};

var playerSide;
const oppSide = playerSide === 1 ? 2 : 1;
var oppName = '';
var isClientP1;

/* 
 When the socket notifies the client that a match has been found, set the player name
 and the opponent name for the match, as well as the turns
*/
socket.on("found_match", (res) => {
  getUser = getUsername();
  let allPlayers = res.allPlayers;
  let foundObj = allPlayers.find(obj => obj.p1.player === getUser || obj.p2.player === getUser);
  foundObj.p1.player === getUser ? oppName = foundObj.p2.player : oppName = foundObj.p1.player;
  foundObj.p1.player === getUser ? playerSide = 1 : playerSide = 2;
  playerSide === 1 ? isClientP1 = true : isClientP1 = false;
});

/*
This React component creates the game board and page, containing sub-functions to update values.

mode - a string, either 'AI' or 'PVP', denoting the match type
*/
function Board({ mode }) {
  var toPlay = 1;
  var move = 1;

  // Temp value
  userRef = useRef({
    data: {
      rating: '?'
    }
  });

  // Temp value
  oppRef = useRef({
    data: {
      rating: '?'
    }
  });

  // Temp value
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
          //Create the first board state
          matchID = res.data;
          interval = setInterval(function () {
            axios.get('http://localhost:5000/api/match-state/' + matchID).then((matchRes) => {
              matchData = matchRes.data;
              let mostRecentBoardID = matchData.boardStates[matchData.boardStates.length - 1];
              axios.get('http://localhost:5000/api/board-state/' + mostRecentBoardID).then((boardRes) => {
                //Update the board
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

  /*
  This function is used to load the opponent's data.
  */
  async function getOppData() {
    var opp;
    if (oppName === 'AI') {
      // if AI, set rating to 800
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
        // Get data for the opponent if not AI
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

  /*
  This function is used to load the game board.

  row - the row of the square to be clicked
  col - the column of the square to be clicked
  */
  function handleClick(row, col) {
    console.log("toPlay: " + toPlay + " playerSide: " + playerSide);
    if (toPlay === playerSide && !gameOver) {
      //Check if the move is allowed
      tempSquares = structuredClone(squares);
      if (checkMoveAllowed(row, col, true)) {
        axios.post('http://localhost:5000/api/add-board-state', {
          match: matchID,
          board: tempSquares,
          move: move + 1,
          toMove: toPlay === 1 ? 2 : 1
        }).then((boardRes) => {
          //Update the board (send the move to the opponent through the socket)
          socket.emit("player_move", { name: getUser, room: room, row: row, col: col });
          toPlay = toPlay === 1 ? 2 : 1;
          socket.emit("reset_timer", room);
          if (checkGameEnd()) {
            endGame();
          }
          else {
            if (mode === 'AI') {
              //Wait for the AI to make a move
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
            }
          }
        });
      }
    }
  }

  /*
  This function handles the AI's turn.
  */
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
    gameOver = true;
    return true;
  }

  //result should be 1 for a win, 0.5 for a draw, and 0 for a loss
  function updateUserRating(result) {
    var expected = 1 / (1 + Math.pow(10, (oppRef.current.data.rating - userRef.current.data.rating) / 400));
    var newRating = Math.round(userRef.current.data.rating + 32 * (result - expected));
    axios.post('http://localhost:5000/api/change-user-rating', {
      username: getUsername(),
      rating: newRating
    });
  }

  // handle opponent leaving early
  function endEarly(winner) {
    if (winner === getUsername()) {
      // update for remaining player
      axios.post('http://localhost:5000/api/update-winner', {
        winner: getUsername(),
        matchID: matchID
      });
      updateUserRating(1);
      alert('Opponent has left. You win by default!');
    }
    else if (winner === oppName) {
      // update for remaining opponent
      axios.post('http://localhost:5000/api/update-winner', {
        winner: oppName,
        matchID: matchID
      });
      updateUserRating(0);
    }
    gameOver = true;
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
    if (p1Score === p2Score) {
      // handle draw
      axios.post('http://localhost:5000/api/update-winner', {
        winner: 'DRAW',
        matchID: matchID
      });
      updateUserRating(0.5);
      alert('DRAW');
    }
    else if (p1Score > p2Score) {
      // if the winner is player 1, update the winner in the database and update the user's rating
      if (playerSide === 1) {
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
      // the winner is player 2, update the winner in the database and update the user's rating
      if (playerSide === 2) {
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

  /*
  This function checks if a move is allowed in a given direction.

  row - the row to be used as the starting point
  col - the column to be used as the starting point
  dirHorizontal - the horizontal direction to check
  dirVertical - the vertical direction to check
  attemptMove - a boolean, true if the move should be attempted, false if not
  */
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

  /*
  This function captures pieces in a given direction.

  row - the row to be used as the starting point
  col - the column to be used as the starting point
  dirHorizontal - the horizontal direction to check
  dirVertical - the vertical direction to check
  */
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

  // loads the board
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

  useEffect(() => {
    gameOver = false;

    // uses structured cloning to copy the board state upon each opponent move
    socket.on('opp_move', (res) => {
      if (toPlay !== playerSide) {
        setTimeout(() => {
          tempSquares = structuredClone(squares);
          if (checkMoveAllowed(res.row, res.col, true)) {
            if (currentBoardData) {
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

    // receive an alert if a user abandons match, remaining player wins
    socket.on("alert", (data) => {
      console.log("alert received");
      if (gameOver)
        return;
      let playerEnded = data.user;
      let winner;
      playerEnded === getUsername() ? winner = oppName : winner = getUsername();
      endEarly(winner);
    });

    return () => {
      socket.off('alert');
      socket.off('opp_move');
    };
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

/*
This function handles the back button on the match page.
*/
function BackButtonMatch() {
  let navigate = useNavigate();
  const leave = () => {
    socket.emit("leave_room", { room: room, name: getUsername() });
    navigate('/home');

    if (!gameOver) {
      // if a player left the game before it was over, update the winner in the database and update the user ratings
      socket.emit("alert_opp", { room: room, user: getUsername() });	// update for remaining player
      axios.post('http://localhost:5000/api/update-winner', {		// update for abandoning player
        winner: oppName,
        matchID: matchID
      });
      updateUserRating(0);
    }
  }
  return (
    <div className='back_button_wrapper'>
      <button onClick={leave} className='back_button green_button fixed'>Back</button>
    </div>
  );
}

// Make a duplicate function of the one in Board so Timer and BackButtonMatch can access it
function updateUserRating(result) {
  var expected = 1 / (1 + Math.pow(10, (oppRef.current.data.rating - userRef.current.data.rating) / 400));
  var newRating = Math.round(userRef.current.data.rating + 32 * (result - expected));
  axios.post('http://localhost:5000/api/change-user-rating', {
    username: getUsername(),
    rating: newRating
  });
}

/*
* Timer component to limit player turn time in multiplayer matches
* Turns last 1 minute and player forfeits on time running out
*/
var toPlay;
function Timer({mode}){
	const Ref = useRef(null);
	
    // The timer state
    const [timer, setTimer] = useState("01:00"); 
    
    // if the player runs out of time, they abandon the match
    if(timer === "00:00" && getToPlay() === getUsername()){
	    if (!gameOver) {
	      // if a player ran out of time before game over, update the winner in the database and update the user ratings
	      socket.emit("alert_opp", { room: room, user: getUsername() });	// update for remaining player
	      axios.post('http://localhost:5000/api/update-winner', {		// update for abandoning player
	        winner: oppName,
	        matchID: matchID
	      });
	      // set timer to max on game end
	      updateUserRating(0);
	      alert('You ran out of time! Game over.');
	    }
	}
 
 	// Return the amount of time left on the timer in total, minutes, and seconds
    const getTimeRemaining = (e) => {
        const total = Date.parse(e) - Date.parse(new Date());
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        return {
            total,
            minutes,
            seconds,
        };
    };
 
 	// Start the timer based on the time that is passed in (1 minute)
    const startTimer = (e) => {
        let { total, minutes, seconds } = getTimeRemaining(e);
        if (total >= 0) {
            setTimer(("0" + minutes) + ":" + (seconds > 9 ? seconds : "0" + seconds));
        }
    };
 
 	// clear the current timer and set another one for 1 minute
    const clearTimer = (e) => {
        setTimer("01:00");
 
        if (Ref.current)
        	clearInterval(Ref.current);
        const id = setInterval(() => {
            startTimer(e);
        }, 1000);
        Ref.current = id;
    };
 
 	// add time onto what was left of the timer
    const getDeadTime = () => {
        let deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + 60);
        return deadline;
    };

  useEffect(() => {
    clearTimer(getDeadTime());
    toPlay = 1;

    // reset timer when socket sends the request after a player move
    // also change display of whose turn it is
    socket.on("timer_reset", (data) => {
      clearTimer(getDeadTime());
      toPlay = toPlay === 1 ? 2 : 1;
      document.getElementById('timerTurn').innerText = getToPlay() + ' turn';
    });

    return () => {
      socket.off('timer_reset');
    };
  }, []);

  // determine whose turn it is and return the name of that player
  function getToPlay() {
    if ((toPlay === 1 && isClientP1) || (toPlay === 2 && !isClientP1))
      return getUsername();
    else
      return oppName;
  }
  // only display timer if it is PvP match
  if (mode !== 'AI') {
    return (
      <div className='timerDiv'>
        <h3 id='timerTurn'> {getToPlay()} turn </h3>
        <h3 id='timer'> {timer} </h3>
      </div>
    );
  }
}

/*
* This function returns the match page, which contains the board, timer, and back button
*/
function Match({ mode }) {
  return (
    <div>
      <BackButtonMatch />
      <Header value='Match' />
      <Timer mode={mode} />
      <Board mode={mode} />
    </div>
  );
}

export default Match;