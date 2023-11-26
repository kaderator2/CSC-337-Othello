import React from 'react';
import { Header, BackButton } from './Components';
import {useNavigate} from "react-router-dom";
import io from "socket.io-client";
import { uRoom, socket } from './Home';

function BackButtonLobby(){
	let navigate = useNavigate();
  	
    const action = () => {
		socket.emit("leave_room", {uRoom});//, username: getUser()});
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
			// TODO: fetch room size from server search of users with room:uRoom
			if(1 === 2) {
				inGame = true;
				navigate('/match/pvp');	
			}		
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
