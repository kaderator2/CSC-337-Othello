/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * This file contains the profile page for the frontend.
 */

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import Default, { Header, BackButton, getUsername, ProfilePicture } from './Components'
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// This component is used to render the player section of the profile page
function PlayerSection() {
    // state variables for the player section
    const [rating, setRating] = useState('?');
    const [playerStats, setPlayerStats] = React.useState({
        lastGamePlayed: "No games played yet",
        totalGamesPlayed: 0,
        gamesWon: 0,
        winPercentage: 0
    }); // State to store player stats

    useEffect(() => {
        //Get data for the current user
        axios.get('http://localhost:5000/api/get-user-data', {
            params: {
                name: getUsername()
            }
        }).then((user) => {
            console.log(user.data);
            setRating(user.data.rating);
        });

        // Fetch player stats
        axios.get('http://localhost:5000/api/get-user-stats/' + getUsername())
            .then((response) => {
                // Assuming the response contains player stats data
                setPlayerStats(response.data);
            })
            .catch((error) => {
                console.error('Error fetching player stats:', error);
            });
    }, []);

    return (
        <div id='player_section'>
            <h2>Player Information</h2>
            <h3 id='player_name'>{getUsername()}</h3>
            <div id='player_details_container' className='centered_container'>
                <p id='player_rating' className='player_details centered_section'><b>Rating:</b> {rating}</p>
                <p id='matches_played' className='player_details centered_section'><b>Matches played:</b> {playerStats.totalGamesPlayed}</p>
                <p id='matches_played' className='player_details centered_section'><b>Wins:</b> {playerStats.gamesWon}</p>
                <p id='matches_played' className='player_details centered_section'><b>Losses:</b> {playerStats.totalGamesPlayed - playerStats.gamesWon}</p>

            </div>
        </div>
    );
}

/*
This component is used to render the replay section of the profile page.
*/
function ReplaySection() {
    // state variables for the replay section
    const [replays, setReplay] = useState([]);
    const [matchesData, setMatchesData] = useState({
        player1Name: '',
        player2Name: '',
        player1Rating: 0,
        player2Rating: 0,
        winner: ''
    });
    useEffect(() => {
        axios.get('http://localhost:5000/api/get-match-history', {
            params: {
                username: getUsername()
            }
        }).then((matches) => {
            setMatchesData(matches.data);
        });
    }, []);

    // function to load the replay section
    const loadReplaySection = () => {
        let arr = [];

        for (let i = matchesData.length - 1, count = 0; i >= 0 && count < 10; i--, count++) {
            arr.push(<Replay id={i} matchData={matchesData[i]} />);
        }

        setReplay(arr);
    }

    useEffect(() => {
        // load the replay section
        loadReplaySection();
    }, [matchesData]);

    return (
        <div id='replay_section'>
            <h2>Replays</h2>
            <div id='replays'>
                {replays}
            </div>
        </div>
    );
}

/*
This component is used to render a replay.
*/
function Replay({ matchData }) {
    let navigate = useNavigate();
    // function to navigate to the replay page
    const goToReplay = () => {
        navigate('/replay', { replace: true, state: { matchData: matchData } });
    }

    return (
        <div className='replay centered_container' onClick={goToReplay}>
            <img src={require('./images/replay.png')} alt='A replay symbol'
                className='replay_details image_contain centered_section' width='50' />
            <p className='replay_details centered_section'><b>Players:</b> {matchData.player1Name}, {matchData.player2Name}</p>
            <p className='replay_details centered_section'><b>Average rating:</b> {(matchData.player1Rating + matchData.player2Rating) / 2}</p>
            <p className='replay_details centered_section'><b>Winner:</b> {matchData.winner}</p>
        </div>
    );
}

/*
This component is used to render the profile page.
*/
function Profile() {

    return (
        <div>
            <BackButton />
            <Header value='Profile' />
            <PlayerSection />
            <ReplaySection />
        </div>
    );
}

export default Profile;