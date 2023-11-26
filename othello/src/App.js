import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';

import Help from './Help';
import Home from './Home';
import Leaderboard from './Leaderboard';
import Match from './Match';
import Profile from './Profile';
import Replay from './Replay';
import Login from './Login';
import Lobby from './Lobby';


function App() {
	const [userIsLoggedIn, setUserIsLoggedIn] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		const checkUserIsLoggedIn = async () => {
			try {
				const response = await axios.get('http://localhost:5000/api/check-user-is-logged-in', { withCredentials: true });
				setUserIsLoggedIn(response.data.isLoggedIn);
			} catch (error) {
				console.error(error);
			}
		};

		checkUserIsLoggedIn();
	}, []);

	useEffect(() => {
		if (userIsLoggedIn === false) {
			navigate('/');
		}
	}, [userIsLoggedIn, navigate]);
	

	return (
		<div className='App'>
			<Routes>
				<Route path='/' element={<Login />} />
				<Route path='/home' element={userIsLoggedIn ? <Home /> : <Navigate to="/" />} />
				<Route path='/help' element={userIsLoggedIn ? <Help /> : <Navigate to="/" />} />
				<Route path='/leaderboard' element={userIsLoggedIn ? <Leaderboard /> : <Navigate to="/" />} />
				<Route path='/match' element={userIsLoggedIn ? <Match /> : <Navigate to="/" />} />
				<Route path='/profile' element={userIsLoggedIn ? <Profile /> : <Navigate to="/" />} />
				<Route path='/replay' element={userIsLoggedIn ? <Replay /> : <Navigate to="/" />} />
				<Route path='/lobby' element={userIsLoggedIn ? <Lobby /> : <Navigate to="/" />} />
			</Routes>
		</div>
	);
}

export default App;