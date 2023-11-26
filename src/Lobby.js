import React from 'react';
import { Header } from './Components';
import {useNavigate} from "react-router-dom";
import { uRoom, socket } from './Home';
import axios from 'axios';

function BackButtonLobby(){
	let navigate = useNavigate();
  	
    const action = () => {
		socket.emit("leave_room", uRoom);
        navigate('/home');
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
			axios.get('http://localhost:5000/api/room-size/' + uRoom)
			.then((size) => {
				console.log("Room size of " + uRoom + ": " + size);
				console.log("Typeof 'size':" + typeof size);
				if(size === 2) {
					inGame = true;
					navigate('/match/pvp'); // TODO: maybe add room number in path	
				}
          	})
          	.catch((err) => {
				console.log("Error sending room size request");
				console.log(err);  
			});		
		}
	};
	
	setInterval(matched, 5000);
	
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
