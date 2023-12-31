/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * This file manages the help menu for the site, which displays instructions on how to play.
 */

import React from 'react';
import {useNavigate} from "react-router-dom";
import { Header, BackButton } from './Components';

/*
This function creates a return button, which routes to the home page.

id - the ID to give the new button
*/
function ReturnButton({id}){
    let navigate = useNavigate();
    const goToHome = () => { 
        navigate('/home');
    }	
	return (
		<button id={id} className="returnButton green_button" onClick={goToHome}> Return Home </button>
	);
}

/*
This React function creates a component page, which was a back button, header, and gameplay
instructions.
*/
function Help() {
    return (
        <div>
            <BackButton />
            <Header value='How to Play' />
            <br></br>
            <h2> Objective </h2>
            <p className='text'> The objective of Othello is to have the most tokens of your color on the board at the
            end of match </p>
            <br></br>
            <h2> Gameplay </h2>
            <p className='text'> A legal move in Othello consists of placing one of your tokens anywhere where there is a straight
            or diagonal path towards another one your tokens already on the board, as long as the space is connected
            to the rest of the existing tokens and there is at least one opponent token in between the anchor and 
            the new move. When placing a token, the entire (straight/diagonal) path from the anchor to the newly-placed 
            token gets converted to your color. Take turns with the other player trying to convert as many tokens
            as you can to your color to win the game! </p>
            <br></br>
            <h2> Ranking </h2>
            <p className='text'> Gain rating points by winning matches against other players! The amount of rating points gained or lost in a 
            match depends on your rating vs your opponent's rating. If you abandon a match, you will forfeit the match and lose rating points. 
            Your total rating points are a way to show your skill-level to other players! </p>
            <br></br>
            <h2> Match History </h2>
            <p className='text'> From the Home page, you can navigate to Match History to view your past matches played. From there, you can
            select a match and replay every move. This can be helpful to analyze where you went wrong, devise strategies,
			or find patterns in gameplay. </p>
			<br></br>
			<ReturnButton id='helpReturn'/>
			<br></br>
        </div>
    );
}

export default Help;