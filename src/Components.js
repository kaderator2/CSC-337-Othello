import React from 'react';
import { useNavigate } from "react-router-dom";
import Cookies from 'universal-cookie';
import io from "socket.io-client";

export const socket = io.connect("http://localhost:3001");

export function Header({ value }) {
    return (
        <div className='main_header'>
            <h1>{value}</h1>
        </div>
    );
}

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

export function NavButton({ path, value, id }) {
    let navigate = useNavigate();
    const goTo = () => {
        let navTo = { path };
        navigate({ navTo });
    }
    return (
        <button id={id} className='navButton green_button fixed' onClick={goTo}> {value} </button>
    );
}

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
            style={divStyles} id={id} ></div>
    );
}

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

// basic helper function to get username from cookies
export function getUsername() {
    const cookies = new Cookies();
    let username = cookies.get('name');
    return username;
}

export default Header("test");