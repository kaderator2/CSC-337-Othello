/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * Lobby.js - This file contains the components for the Lobby page while players
 * are waiting to be matched up.
 */

import React from 'react';
import { Header, getUsername, socket } from './Components';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export var room;

/* BackButton like in Components.js but leaves the socket room too */
export function BackButtonLobby() {
    let navigate = useNavigate();

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

// The default component for this page (or the page itself, essentially)
function Lobby() {
    let navigate = useNavigate();

    // tell the socket that the current user has been matched
    // put them into a room with one other player and direct them to the Match page
    socket.on("found_match", (obj) => {
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
