import React from 'react';

import Default, {Header, BackButton, PlayerData} from './Components'

function ForwardArrowButton({id}) {
    return (
        /*TODO make arrow onclick map to something*/
        <div id={id} className='arrow_container' /*onClick=*/>
            <img src={require('./images/arrow_right.png')} alt='A forward arrow symbol'
                className='image_contain' width='50' />
        </div>
    );
}
function BackArrowButton({id}) {
    return (
        /*TODO make arrow onclick map to something*/
        <div id={id} className='arrow_container' /*onClick=*/>
            <img src={require('./images/arrow_left.png')} alt='A back arrow symbol'
                className='image_contain' width='50' />
        </div>
    );
}
function Replay() {
    return (
        <div>
            <BackButton />
            <Header value='Replay' />
            <div className='match_container centered_container'>
                <div className='game_container centered_section'>
                    <PlayerData id='top_player' name='test' rating='1400' />
                    <PlayerData id='bottom_player' name='test2' rating='1450' />
                    <div className="game">
                        <p>Temp, game board location until implementation figured out</p>
                    </div>
                </div>
                <ForwardArrowButton id='replay_forward' />
                <BackArrowButton id='replay_back' />
            </div>
        </div>
    );
}

export default Replay;