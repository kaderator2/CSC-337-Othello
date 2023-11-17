import React from 'react';

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
	function handleClick(){
		window.location.href = '/help';
	}	
	return (
		<button id="helpButton" onClick={handleClick}> ? </button>
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
	return (
		<button id="logoutButton" onClick={handleClick}> Log out </button>
	);
}

function ProfileButton(){
	function handleClick(){
		window.location.href = '/profile';
	}
	return (
		<button id="profileButton" onClick={handleClick}> Profile / Recent Games </button>
	);
}

function PlayButton({opponent}){
	function handleClick(){
		// TODO: determine what kind of match later
		if({opponent} == "AI")
			window.location.href = '/Match';
		else
			window.location.href = '/Match';
	}
	return (
		<button id={"play"+opponent+"Button"} className="playButton" onClick={handleClick}>
		 Play vs {opponent} </button>
	);
}

function Logo({src, id}){
	return(
		<img src={src} id={id} className="logo"></img>
	);
}

function ProfilePicture({id, size, src}){
	return(
		<img src={src} id={id} className="pfp" style={{width:size, height:size}}></img>
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
            <h1 id='welcome'>Welcome {getUser()}!</h1>
            <MainHome id='mainHome' />
            <SidePanel id='sidePanel' />
        </div>
    );
}

export default Home;