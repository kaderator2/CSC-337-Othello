/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * socket.js - This file contains the connection of the socket.io server and all the
 * communication actions between the socket and the other pages in the project
 */

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
    	origin: "http://localhost:3000",
    	methods: ["GET", "POST"],
  	},
});

let allRooms = {};
let queue=[];
let playingArr=[];
let roomNumber = 1;

// Open all listneners when a user connects
io.on("connection", (socket) => {
  	console.log(`User Connected: ${socket.id}`);

	// Put the user into the given room
 	socket.on("join_room", (data) => {
		console.log('Joined room ' + data);
    	socket.join(data);
  	});
  	
  	// Take the user out of the given room
  	socket.on("leave_room", (data) => {
    	console.log('Left room ' + data.room);
    	//let clients = io.sockets.adapter.rooms.get(data.room);
    	//console.log(clients);
    	queue.splice(queue.indexOf(data.name), 1);
    	socket.leave(data.room);
  	});
  	
  	// If a user abandons a match, alert the other user
  	socket.on("alert_opp", (data) => {
    	io.to(data.room).emit('alert', data);
  	});
  	
  	// Action to queue a user into matchmaking
  	// notify both users' clients that a match has been found
  	socket.on("queue", (user) => {
		if(user.name != null){
			queue.push(user.name);
			console.log("Queued " + user.name);
			console.log("cur roomNumber: " + roomNumber);
			
			if(queue.length >= 2){
				let p1Obj = {
					player : queue[0],
					room : roomNumber,
					color : "BLACK",
					move : ""
				}
				let p2Obj = {
					player : queue[1],
					room : roomNumber,
					color : "WHITE",
					move : ""
				}
				let obj = {
					p1: p1Obj,
					p2: p2Obj,
					sum : 1
				}
				playingArr.push(obj);
				allRooms[roomNumber] = [queue[0], queue[1]];
				queue.splice(0,2);
				roomNumber++;
				console.log("increased roomNumber to: " + roomNumber);
				io.emit("found_match", {allPlayers : playingArr})
			}
		}	  
	});
	
	// take in a (row, col) player move, and send it to the other player
	socket.on("player_move", (data) => {
    	let room = data.room;
    	io.to(room).emit('opp_move', {row : data.row, col : data.col});
  	});
});

server.listen(3001, () => {
  console.log("SOCKET SERVER IS RUNNING");
});