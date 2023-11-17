import logo from './logo.svg';
import './App.css';
import React from 'react';
import {Route, Routes, Link} from 'react-router-dom';

import Help from './Help';
import Home from './Home';
import Leaderboard from './Leaderboard';
import Match from './Match';
import Profile from './Profile';
import Replay from './Replay';
import Login from './Login';

function App() {
  return (
	<div className='App'>
		<Routes>
			<Route exact path='/' element={<Login />} />
			<Route exact path='/home' element={<Home />} />
			<Route exact path='/help' element={<Help />} />
			<Route exact path='/leaderboard' element={<Leaderboard />} />
			<Route exact path='/match' element={<Match />} />
			<Route exact path='/profile' element={<Profile />} />
			<Route exact path='/replay' element={<Replay />} />
		</Routes>
	</div>
  );
}

export default App;

/**
 * Gets the name of the current user from the browser cookie
 * @returns the name of the current user as a string
 */
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
		if(currentUser.charAt(i) == '"'){
			currentUser = currentUser.substring(0,i);
			break;
		}
	}
	return currentUser;
}

/**
 * Action for when logout button on homepage is clicked (WIP)
 */

/*
let logoutButton = document.getElementById("logoutButton");
logoutButton.onclick = () => {
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
};
*/
