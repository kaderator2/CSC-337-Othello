import React from 'react';

function ProfileHeader () {
    return (
        <div id='profile_header' className='main_header'>
            <h1>Profile</h1>
        </div>
    );
}

function PlayerSection() {
    return (
        <div id='player_section'>
            <h2>Player Information</h2>
            <h3 id='player_name'>Player Name</h3>
            <p id='player_rating' className='player_details'>rating</p>
            <p id='matches_played' className='player_details'>x matches played</p>
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
            <p className='replay_details centered_section'><b>Players:</b> ?, ?</p>
            <p className='replay_details centered_section'><b>Average rating:</b> ?</p>
            <p className='replay_details centered_section'><b>Winner:</b> ?</p>
        </div>
    );
}
function Profile() {
    return (
        <div>
            <ProfileHeader />
            <PlayerSection />
            <ReplaySection />
        </div>
    );
}

export default Profile;