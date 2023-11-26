import {useNavigate} from "react-router-dom";
import { ProfilePicture, Header } from './Components';
import React, { useState, useEffect } from 'react';
import io from "socket.io-client";

export const socket = io.connect("http://localhost:3001");
export var uRoom;

function getUser(){
	let cookie = decodeURIComponent(document.cookie);
	let currentUser;
	for(let i = 0; i < cookie.length; i++) {
	    let sub = cookie.substring(i);
		if(sub.startsWith('"username":"')){
			currentUser = cookie.substring(i+12);
			break;
		}
	}
	for(let i=0; i < currentUser.length; i++){
		if(currentUser.charAt(i) === '"'){
			currentUser = currentUser.substring(0,i);
			break;
		}
	}
	return currentUser;
}

function HelpButton(){
	let navigate = useNavigate();
	const goToHelp = () => { 
        navigate('/help');
    }

	return (
		<button id="helpButton" className='green_button fixed' onClick={goToHelp}> ? </button>
	);
}

function LogoutButton(){
	function handleClick(){
		let url = 'http://localhost:5000/logout/' + getUser();
		let p = fetch(url);
		p.then((result) => {
			return result.text();
		}).then((text) => {
			if(text == 'USER DOES NOT EXIST')
				console.log(text);
		})
		.catch((error) => {
			console.log('Error sending logout request');
			console.log(error);
		});
	}
	
	{/*Temporary*/}
	let navigate = useNavigate();
	const goToLogin = () => { 
        navigate('/');
    }
		
	return (
		<button id="logoutButton" className='green_button fixed' onClick={goToLogin}> Log out </button>
	);
}

function ProfileButton(){
	let navigate = useNavigate();
	const goToProfile = () => { 
        navigate('/profile');
    }
	return (
		<button id="profileButton" className='green_button fixed' onClick={goToProfile}> Profile </button>
	);
}

function LeaderboardButton(){
	let navigate = useNavigate();
	const goToLB = () => { 
        navigate('/leaderboard');
    }
	return (
		<button id="lbButton" className='green_button fixed' onClick={goToLB}> Leaderboard </button>
	);
}

function PlayButton({opponent}){
	let navigate = useNavigate();
	let playerCounter = 0;
	let roomNumber = 1;
	
	// -------- Socket.io stuffs -------------
	//Room State
  	const [room, setRoom] = useState("");

  	const joinRoom = () => {
    	if (room !== "") {
      		socket.emit("join_room", {room});//, username: getUser()});
    	}
  	};
	
	const goToMatch = () => {
		if(opponent !== "Player") {
			navigate('/match/ai');
		}
		else {
			setRoom(roomNumber);
			uRoom = roomNumber;
			// TODO: User schema include room number of current match?
			// control of 2-player lobbies
			playerCounter++;
			roomNumber = playerCounter%2===1 ? roomNumber : roomNumber+1;
			console.log('joining room from Home')
			joinRoom();
			//navigate('/lobby');
		}
	}
	return (
		<button id={"play"+opponent+"Button"} className="playButton green_button fixed" onClick={goToMatch}>
		 Play vs {opponent} </button>
	);
}

function Logo({id, size}){
	var style = {
		    backgroundImage:'url(' + require('./images/othello_logo.png') + ')',
            width:size,
            height:size
    };
	return(
		// eslint-disable-next-line jsx-a11y/alt-text
		//<img src='./images/othello_logo.png' id={id} className="logo" style={style}></img>
		<div className='match_pfp image_contain centered_section'
		  style={style} id={id}></div>
	);
}

function SidePanel({id}){
	return (
        <div id={id}>
            <ProfilePicture id="homePFP" size="150px"/>  {/* Temp size and src */}
            <br></br>
            <ProfileButton/>
            <br></br>
            <LogoutButton/>
        </div>
    );
}

function MainHome({id}){
	return (
        <div id={id}>
            <HelpButton/>
            <Logo id="homeLogo" size="350px"/>
            <br></br>
            <PlayButton opponent="Player" />
            <br></br>
            <PlayButton opponent="AI" />
            <br></br>
            <LeaderboardButton />
        </div>
    );
}

function Home() {
    return (
        <div id='Home'>
            <Header value='Welcome to Othello !' />
            <MainHome id='mainHome' />
            <SidePanel id='sidePanel' />
        </div>
    );
}

export default Home;