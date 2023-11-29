import React from 'react';
import { Header } from './Components';
import {useNavigate} from "react-router-dom";
import { socket } from './Home';
import axios from 'axios';

var room;

function BackButtonLobby(){
	let navigate = useNavigate();
  	
    const action = () => {
		socket.emit("leave_room", room);
		axios.get('http://localhost:5000/api/leave-room/' + getUser())
		.then(() => {
			console.log("Room left successfully");
			navigate('/home');
      	})
      	.catch((err) => {
			console.log(err);  
		});
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
	
	function matched(){
		if(inGame)
			return;
		else {
			axios.get('http://localhost:5000/api/check-queue/')
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
	
	setInterval(matched, 2000);
	
    return (
        <div>
            <BackButtonLobby />
            <Header value='Finding a match...' />
            <br></br>
            <h2> Please wait while we find a match, or return with the Back button </h2>
        </div>
    );
}

export default Lobby;
