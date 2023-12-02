
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

io.on("connection", (socket) => {
  	console.log(`User Connected: ${socket.id}`);

 	socket.on("join_room", (data) => {
		console.log('Joined room ' + data);
    	socket.join(data);
  	});
  	
  	socket.on("leave_room", (data) => {
    	console.log('Left room ' + data.room);
    	//let clients = io.sockets.adapter.rooms.get(data.room);
    	//console.log(clients);
    	queue.splice(queue.indexOf(data.name), 1);
    	socket.leave(data.room);
  	});
  	
  	socket.on("alert_opp", (data) => {
    	io.to(data.room).emit('alert', data);
  	});
  	
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
	
	socket.on("player_move", (data) => {
    	//TODO send move only to other player
    	//let moved = data.name;
    	//let sendTo = moved === allRooms.room[0] ? allRooms.room[1] : allRooms.room[1];
    	let room = data.room;
    	io.to(room).emit('opp_move', {row : data.row, col : data.col});
  	});
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});