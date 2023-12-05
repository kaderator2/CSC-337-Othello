/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * This file contains several components that will be used in several files. To keep
 * the project cleaner, they are just imported into the files that use them.
 */

import React from 'react';
import { useNavigate } from "react-router-dom";
import Cookies from 'universal-cookie';
import io from "socket.io-client";

// reference to the socket server
export const socket = io.connect("http://localhost:3001");

// Header of most all of the pages. 'value' is the text to be displayed depending on the page
export function Header({ value }) {
    return (
        <div className='main_header'>
            <h1>{value}</h1>
        </div>
    );
}

// A back button used to redirect users back to the Home page on click
export function BackButton() {
    let navigate = useNavigate();
    const goToHome = () => {
        navigate('/home');
    }

    return (
        <div className='back_button_wrapper'>
            <button onClick={goToHome} className='back_button green_button fixed'>Back</button>
        </div>
    );
}

// The profile picture of the user, and its container
// Each declaration may give the PFP an id, a size, and the image to display
export function ProfilePicture({ id, size, src }) {
    if (src) {
        var divStyles = {
            backgroundImage: 'url(' + require(src) + ')',
            width: size,
            height: size
        };
    }
    else {
        var divStyles = {
            backgroundImage: 'url(' + require('./images/default_pfp.jpg') + ')',
            width: size,
            height: size
        };
    }

    return (
        <div className='match_pfp image_contain centered_section'
            style={divStyles} id={id}></div>
    );
}

// A container containing a player's profile picture, name, and rating
// These, plus an id, may be selected when used in other files
export function PlayerData({ id, name, rating, pfp }) {
    return (
        <div id={id} className='player_data centered_container'>
            {/*<div className='match_pfp image_contain centered_section' style={divStyles}>
            </div>*/}
            <ProfilePicture src={pfp} />
            <div className='match_player_wrapper centered_section'>
                <h3>{name}</h3>
                <p>{rating}</p>
            </div>
        </div>
    );
}

// A basic helper function to get username from cookies
export function getUsername() {
    const cookies = new Cookies();
    let username = cookies.get('name');
    return username;
}

export default Header("test");