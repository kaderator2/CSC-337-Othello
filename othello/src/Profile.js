import React from 'react';
import Default, {Header, BackButton} from './Components'

function PlayerSection() {
    return (
        <div id='player_section'>
            <h2>Player Information</h2>
            <h3 id='player_name'>Player Name</h3>
            <div id='player_details_container' className='centered_container'>
                <p id='player_rating' className='player_details centered_section'><b>Rating:</b> x</p>
                <p id='matches_played' className='player_details centered_section'><b>Matches played:</b> x</p>
            </div>
        </div>
    );
}

function ReplaySection() {
    return (
        <div id='replay_section'>
            <h2>Replays</h2>
            <div id='replays'>
                {/* TODO temp replays here for testing. Actual replays should be loaded from DB on load */}
                <Replay />
                <Replay />
                <Replay />
                <Replay />
            </div>
        </div>
    );
}

function Replay() {
    return (
        //TODO set up onclick for replays to go to respective replay on page.
        <div className='replay centered_container' /*onclick={}*/>
            <img src={require('./images/replay.png')} alt='A replay symbol'
                className='replay_details replay_image centered_section' width='50' />
            <p className='replay_details centered_section'><b>Players:</b> ?, ?</p>
            <p className='replay_details centered_section'><b>Average rating:</b> ?</p>
            <p className='replay_details centered_section'><b>Winner:</b> ?</p>
        </div>
    );
}
function Profile() {
    return (
        <div>
            <BackButton />
            <Header value='Profile' />
            <PlayerSection />
            <ReplaySection />
        </div>
    );
}

export default Profile;