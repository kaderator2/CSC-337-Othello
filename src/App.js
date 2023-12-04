/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * This file contains the initial component of the site, which creates routes to the pages.
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoutes from './ProtectedRoutes';
import Help from './Help';
import Home from './Home';
import Leaderboard from './Leaderboard';
import Match from './Match';
import Profile from './Profile';
import Replay from './Replay';
import Login from './Login';
import Lobby from './Lobby';

/*
React component function, visited first on site load. Creates routes to each page.
*/
function App() {
	return (
		<div className='App'>
			<Routes>
				<Route path='/' element={<Login />} />
				<Route exact path='/' element={<ProtectedRoutes />}>
					<Route exact path='/home' element={<Home />} />
					<Route exact path='/help' element={<Help />} />
					<Route exact path='/leaderboard' element={<Leaderboard />} />
					<Route exact path='/match/ai' element={<Match mode='AI'/>} />
					<Route exact path='/match/pvp' element={<Match mode='PVP'/>} />
					<Route exact path='/profile' element={<Profile />} />
					<Route exact path='/replay' element={<Replay />} />
					<Route exact path='/lobby' element={<Lobby />} />
				</Route>
			</Routes>
		</div>
	);
}

export default App;
