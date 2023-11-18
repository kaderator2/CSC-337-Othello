import React from 'react';
import {useNavigate} from "react-router-dom";
import {BackButton} from './Components';

function RankTable({list}){
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
	            	<tr>
	            		{/* Possible way to do rankings 
	            		<td> 1 </td>
	            		<td> {list[0].username} </td>
	            		<td> {list[0].rating} </td> */}
	            		<td> 1 </td>
	            		<td> . </td>
	            		<td> 0 </td>
	            	</tr>
	            	<tr>
	            		<td> 2 </td>
	            		<td> . </td>
	            		<td> 0 </td>
	            	</tr>
	            	<tr>
	            		<td> 3 </td>
	            		<td> . </td>
	            		<td> 0 </td>
	            	</tr>
	            	<tr>
	            		<td> 4 </td>
	            		<td> . </td>
	            		<td> 0 </td>
	            	</tr>
	            	<tr>
	            		<td> 5 </td>
	            		<td> . </td>
	            		<td> 0 </td>
	            	</tr>
	            	<tr>
	            		<td> 6 </td>
	            		<td> . </td>
	            		<td> 0 </td>
	            	</tr>
	            	<tr>
	            		<td> 7 </td>
	            		<td> . </td>
	            		<td> 0 </td>
	            	</tr>
	            	<tr>
	            		<td> 8 </td>
	            		<td> . </td>
	            		<td> 0 </td>
	            	</tr>
	            	<tr>
	            		<td> 9 </td>
	            		<td> . </td>
	            		<td> 0 </td>
	            	</tr>
	            	<tr>
	            		<td> 10 </td>
	            		<td> . </td>
	            		<td> 0 </td>
	            	</tr>
	            </tbody>
            </table>
        </div>
    );
}

function Leaderboard() {
	function getTopPlayers(){
		{/* List of Objects with username and rating */}
		let list;	
		let url = 'http://localhost:5000/getTopPlayers/';
		{/*
		let p = fetch(url);
		p.then((results) =>{
			for(let i=0; i<results.length; i++){
				let player = {name : results[i].username, rating : results[i].rating};
				list.push(player);
			}
			return list;
		})
		.catch((err) =>{
			console.log('Error getting top players for leaderboard');
			console.log(err);
		});
		*/}
	}
	
    return (
        <div>
            <h1>Top Ranked Players</h1>
            <RankTable />
            <BackButton />
        </div>
    );
}

export default Leaderboard;