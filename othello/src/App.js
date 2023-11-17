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