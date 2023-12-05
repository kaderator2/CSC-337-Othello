/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * This file contains the lobby page for the frontend. This page is used to
 * find a match.
 */

import React from 'react';
import { Header, getUsername, socket } from './Components';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export var room;

/* BackButton like in Components but leaves socket room and opponent wins match if match is left */
export function BackButtonLobby() {
    let navigate = useNavigate();

    // leave room and navigate to home
    const action = () => {
        socket.emit("leave_room", { room: room, name: getUsername() });
        navigate('/home');
    }

    return (
        <div className='back_button_wrapper'>
            <button onClick={action} className='back_button green_button fixed'>Back</button>
        </div>
    );
}

// This component is used to render the lobby page.
function Lobby() {
    let navigate = useNavigate();

    // when the component mounts, find a match
    socket.on("found_match", (obj) => {
        // query to find the room
        let allPlayers = obj.allPlayers;
        let foundObj = allPlayers.find(obj => obj.p1.player === getUsername() || obj.p2.player === getUsername());
        room = foundObj.p1.room;
        socket.emit("join_room", room);
        navigate('/match/pvp');
    });

    return (
        <div>
            <BackButtonLobby />
            <Header value='Finding a match...' />
            <br></br>
            <h2> Please wait while we find a match, or return with the Back button </h2>
        </div>
    );
}

export default Lobby;
