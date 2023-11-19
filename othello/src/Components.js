import React from 'react';
import { useNavigate } from "react-router-dom";

export function Header ({value}) {
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

export function NavButton({path, value, id}){
	let navigate = useNavigate();
	const goTo = () => { 
		let navTo = {path};
        navigate({navTo});
    }
	return (
		<button id={id} className='navButton green_button fixed' onClick={goTo}> {value} </button>
	);
}

export function ProfilePicture({id, size, src}){
	return(
		// eslint-disable-next-line jsx-a11y/alt-text
		<img src={src} id={id} className="pfp" style={{width:size, height:size}}></img>
	);
}

export function PlayerData({id, name, rating, pfp}) {
    if(pfp) {
        var divStyles = {
            backgroundImage:'url(' + require(pfp) + ')'
        };
    }
    else {
        var divStyles = {
            backgroundImage:'url(' + require('./images/default_pfp.jpg') + ')',
        };
    }
    return (
        <div id={id} className='player_data centered_container'>
            <div className='match_pfp image_contain centered_section' style={divStyles}>
            </div>
            <div className='match_player_wrapper centered_section'>
                <h3>{name}</h3>
                <p>{rating}</p>
            </div>
        </div>
    );
}

export default Header("test");