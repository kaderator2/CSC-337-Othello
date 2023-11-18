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
            <button onClick={goToHome} className='back_button'>Back</button>
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
		<button id={id} className='navButton' onClick={goTo}> {value} </button>
	);
}

export function ProfilePicture({id, size, src}){
	return(
		// eslint-disable-next-line jsx-a11y/alt-text
		<img src={src} id={id} className="pfp" style={{width:size, height:size}}></img>
	);
}

export default Header("test");