import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import ProtectedRoutes from './ProtectedRoutes';
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
				<Route path='/' element={<Login />} />
				<Route exact path='/' element={<ProtectedRoutes />}>
					<Route exact path='/home' element={<Home />} />
					<Route exact path='/help' element={<Help />} />
					<Route exact path='/leaderboard' element={<Leaderboard />} />
					<Route exact path='/match' element={<Match />} />
					<Route exact path='/profile' element={<Profile />} />
					<Route exact path='/replay' element={<Replay />} />
				</Route>
			</Routes>
		</div>
	);
}

export default App;
