
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

io.on("connection", (socket) => {
  	console.log(`User Connected: ${socket.id}`);

 	socket.on("join_room", (data) => {
		console.log('Joined room ' + data.room);
    	socket.join(data.room);
  	});
  	
  	socket.on("leave_room", (data) => {
    	console.log('Left room ' + data.room);
    	socket.leave(data.room);
  	});
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});