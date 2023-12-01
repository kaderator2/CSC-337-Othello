import React from 'react';
import { Header, getUsername, socket } from './Components';
import {useNavigate} from "react-router-dom";
import axios from 'axios';

export var room;

/* BackButton like in Components but leaves socket room and opponent wins match if match is left */
export function BackButtonLobby({from}){
	let navigate = useNavigate();
  	
    const action = () => {
		/*axios.get('http://localhost:5000/api/leave-room/' + getUsername())
		.then(() => {
			navigate('/home');
      	})
      	.catch((err) => {
			console.log(err);  
		});*/
		socket.emit("leave_room", {room:room, name:getUsername()});
		navigate('/home');
		
		if({from} === "Match"){
			//TODO opponent wins (change ratings)
			socket.emit("alert_opp", room);
			socket.on("alert", () => {
				alert('Opponent has left. You win by default!');
			})
		}
    }

    return (
        <div className='back_button_wrapper'>
            <button onClick={action} className='back_button green_button fixed'>Back</button>
        </div>
    );
}


function Lobby() {
	let navigate = useNavigate();
	let inGame = false;
	let name = getUsername();
	
	socket.on("found_match", (obj) => {
		// query to find the room
		let allPlayers = obj.allPlayers;
		let foundObj = allPlayers.find(obj => obj.p1.player === getUsername());
		room = foundObj.p1.room;
		socket.emit("join_room", room);
		navigate('/match/pvp'); // TODO: maybe add room number in path	
	});
	
	/*function matched(){
		if(inGame)
			return;
		else {
			axios.get('http://localhost:5000/api/check-queue/' + name)
			.then((res) => {
				room = res.data;
				if(room !== 0) {	// 0 means match not found
					inGame = true;
					socket.emit("join_room", room);
					navigate('/match/pvp'); // TODO: maybe add room number in path	
				}
          	})
          	.catch((err) => {
				console.log("Error sending check-queue request");
				console.log(err);  
			});		
		}
	};
	
	setInterval(matched, 2000);*/
	
    return (
        <div>
            <BackButtonLobby from="lobby"/>
            <Header value='Finding a match...' />
            <br></br>
            <h2> Please wait while we find a match, or return with the Back button </h2>
        </div>
    );
}

export default Lobby;
