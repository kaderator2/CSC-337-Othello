/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * This file contains all the socket.io code for the backend. Handles
 * all the game related connections.
 */

import React, { useState, useEffect } from 'react';
import { BackButton } from './Components';
import axios from 'axios';

function RankTable({ list }) {
	const [topTenPlayers, setTopTenPlayers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		axios.get('http://localhost:5000/api/get-top-ten')
			.then((res) => {
				// Assuming res.data contains the array of top ten users
				setTopTenPlayers(res.data);
			})
			.catch((err) => {
				console.log(err);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	if (isLoading) {
		return <div>Loading...</div>; // Render loading indicator while loading top 10 players
	}

	return (
		<div>
			<table id='rankTable'>
				<thead>
					<tr>
						<th> Rank </th>
						<th> Player Name </th>
						<th> Rating </th>
					</tr>
				</thead>
				<tbody>
					{topTenPlayers.map((player, index) => (
						<tr className='lbRow' key={player._id}>
							<td> {index + 1} </td>
							<td> {player.username} </td>
							<td> {player.rating} </td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function Leaderboard() {
	return (
		<div>
			<h1>Top Ranked Players</h1>
			<RankTable />
			<BackButton />
		</div>
	);
}

export default Leaderboard;
