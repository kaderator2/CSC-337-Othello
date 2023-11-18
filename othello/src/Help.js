import React from 'react';
import {useNavigate} from "react-router-dom";

function ReturnButton({id}){
    let navigate = useNavigate();
    const goToHome = () => { 
        navigate('/home');
    }	
	return (
		<button id={id} className="returnButton" onClick={goToHome}> Return Home </button>
	);
}

function Help() {
    return (
        <div>
            <h1> How to Play </h1>
            <br></br>
            <h2> Objective </h2>
            <p> The objective of Othello is to have the most tokens of your color on the board at the
            end of match </p>
            <br></br>
            <h2> Gameplay </h2>
            <p> A legal move in Othello consists of placing one of your tokens anywhere where there is a straight
            or diagonal path towards another one your tokens already on the board, as long as the space is connected
            to the rest of the existing tokens and there is at least one opponent token in between the anchor and 
            the new move. When placing a token, the entire (straight/diagonal) path from the anchor to the newly-placed 
            token gets converted to your color. Take turns with the other player trying to convert as many tokens
            as you can to your color to win the game! </p>
            <br></br>
            <h2> Ranking </h2>
            <p> Gain rating points by winning matches against other players! Your total rating points are a way to show
            your skill-level to other players. </p>
            <br></br>
            <h2> Match History </h2>
            <p> From the Home page, you can navigate to Match History to view your past matches played. From there, you can
            select a match and replay every move. This can be helpful to analyze where you went wrong, devise strategies,
			or find patterns in gameplay. </p>
			<br></br>
			<ReturnButton id='helpReturn'/>
			<br></br>
        </div>
    );
}

export default Help;