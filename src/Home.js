/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * This file manages the main menu of the site, which contains buttons to access the help menu,
 * play matches, view profile, and log out.
 */

import { useNavigate } from "react-router-dom";
import { ProfilePicture, Header, getUsername, socket } from './Components';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';

/*
This React component creates a help button, which routes to the help page.
*/
function HelpButton() {
	let navigate = useNavigate();
	const goToHelp = () => {
		navigate('/help');
	}

	return (
		<button id="helpButton" className='green_button fixed' onClick={goToHelp}> ? </button>
	);
}

/*
This React component creates a log out button, which sends a request to log out the current user. Then, it
clears the cookie and sends the user back to the login page.
*/
function LogoutButton() {
	let navigate = useNavigate();
	const cookies = new Cookies();
	const goToLogin = () => {
		// Sends get request to logout
		axios.get('http://localhost:5000/api/logout/')
			.then((res) => {
				console.log("Logged out!");
				cookies.remove('TOKEN');
				cookies.remove('name');
				navigate('/');
			}).catch((err) => {
				console.log("Error logging out");
				console.log(err);
			});
	}

	return (
		<button id="logoutButton" className='green_button fixed' onClick={goToLogin}> Log out </button>
	);
}

/*
This React component creates a profile button, which routes to the profile page.
*/
function ProfileButton() {
	let navigate = useNavigate();
	const goToProfile = () => {
		navigate('/profile');
	}
	return (
		<button id="profileButton" className='green_button fixed' onClick={goToProfile}> Profile </button>
	);
}

/*
This React component creates a leaderboard button, which routes to the leaderboard page.
*/
function LeaderboardButton() {
	let navigate = useNavigate();
	const goToLB = () => {
		navigate('/leaderboard');
	}
	return (
		<button id="lbButton" className='green_button fixed' onClick={goToLB}> Leaderboard </button>
	);
}

/*
This React component creates a help button, which routes to the respective page for the given match type.
If against a player, adds them to the queue.

opponent - a string, the type of match to be played.
*/
function PlayButton({ opponent }) {
	let navigate = useNavigate();

	const goToMatch = () => {
		if (opponent === "AI") {
			navigate('/match/ai');
		}
		else {
			let name = getUsername();
			socket.emit("queue", { name: name });
			navigate('/lobby');
		}
	}
	return (
		<button id={"play" + opponent + "Button"} className="playButton green_button fixed" onClick={goToMatch}>
			Play vs {opponent} </button>
	);
}

/*
This React component creates a logo for the home page.

id - the ID to give the component.
size - how big to make the image.
*/
function Logo({ id, size }) {
	var style = {
		backgroundImage: 'url(' + require('./images/othello_logo.png') + ')',
		width: size,
		height: size
	};
	return (
		// eslint-disable-next-line jsx-a11y/alt-text
		//<img src='./images/othello_logo.png' id={id} className="logo" style={style}></img>
		<div className='match_pfp image_contain centered_section'
			style={style} id={id}></div>
	);
}

/*
This React component creates the sidebar of the home page.

id - the ID to give the component
*/
function SidePanel({ id }) {
	return (
		<div id={id}>
			<ProfilePicture id="homePFP" size="150px" />  {/* Temp size and src */}
			<br></br>
			<ProfileButton />
			<br></br>
			<LogoutButton />
		</div>
	);
}

/*
This React component creates the middle of the home page.

id - the ID to give the component
*/
function MainHome({ id }) {
	return (
		<div id={id}>
			<HelpButton />
			<Logo id="homeLogo" size="350px" />
			<br></br>
			<PlayButton opponent="Player" />
			<br></br>
			<PlayButton opponent="AI" />
			<br></br>
			<LeaderboardButton />
		</div>
	);
}

/*
This React component puts together the overall page layout.
*/
function Home() {
	return (
		<div id='Home'>
			<Header value={'Welcome to Othello ' + getUsername() + '!'} />
			<MainHome id='mainHome' />
			<SidePanel id='sidePanel' />
		</div>
	);
}

export default Home;