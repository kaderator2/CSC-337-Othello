import React from 'react';
import {useNavigate} from "react-router-dom";
import { ProfilePicture, NavButton } from './Components';

function getUser(){
	let cookie = decodeURIComponent(document.cookie);
	let currentUser;
	for(let i = 0; i < cookie.length; i++) {
	    let sub = cookie.substring(i);
		if(sub.startsWith('"username":"')){
			currentUser = cookie.substring(i+12);
			break;
		}
	}
	for(let i=0; i < currentUser.length; i++){
		if(currentUser.charAt(i) == '"'){
			currentUser = currentUser.substring(0,i);
			break;
		}
	}
	return currentUser;
}

function HelpButton(){
	let navigate = useNavigate();
	const goToHelp = () => { 
        navigate('/help');
    }

	return (
		<button id="helpButton" onClick={goToHelp}> ? </button>
	);
}

function LogoutButton(){
	function handleClick(){
		let url = 'http://localhost:5000/logout/' + getUser();
		let p = fetch(url);
		p.then((result) => {
			return result.text();
		}).then((text) => {
			if(text == 'USER DOES NOT EXIST')
				console.log(text);
		})
		.catch((error) => {
			console.log('Error sending logout request');
			console.log(error);
		});
	}
	
	{/*Temporary*/}
	let navigate = useNavigate();
	const goToLogin = () => { 
        navigate('/');
    }
		
	return (
		<button id="logoutButton" onClick={goToLogin}> Log out </button>
	);
}

function ProfileButton(){
	let navigate = useNavigate();
	const goToProfile = () => { 
        navigate('/profile');
    }
	return (
		<button id="profileButton" onClick={goToProfile}> Profile </button>
	);
}

function PlayButton({opponent}){
	let navigate = useNavigate();
	const goToMatch = () => { 
        // TODO: determine what kind of match later
		if({opponent} == "AI") {
			navigate('/match');
		}
		else {
			navigate('/match');
		}
	}
	return (
		<button id={"play"+opponent+"Button"} className="playButton" onClick={goToMatch}>
		 Play vs {opponent} </button>
	);
}

function Logo({src, id}){
	return(
		<img src={src} id={id} className="logo"></img>
	);
}

function SidePanel({id}){
	return (
        <div id={id}>
            <ProfilePicture id="homePFP" src="" size="50px"/>  {/* Temp size and src */}
            <ProfileButton/>
            <LogoutButton/>
        </div>
    );
}

function MainHome({id}){
	return (
        <div id={id}>
            <HelpButton/>
            <Logo src="" id="homeLogo"/>
            <PlayButton opponent="Player" />
            <PlayButton opponent="AI" />
        </div>
    );
}

function Home() {
    return (
        <div id='Home'>
            <h1 id='welcome'>Welcome {/*getUser()*/}!</h1>
            <MainHome id='mainHome' />
            <SidePanel id='sidePanel' />
        </div>
    );
}

export default Home;