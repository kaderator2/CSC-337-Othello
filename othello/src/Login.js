import React from 'react';

function InputPair({id, value, type}) {
    return (
        <div className='input_pair'>
            <label for={id}>{value}</label>
            <input type={type} name={id} id={id} className='inputs' pattern='.{8,}'
                title='Eight or more characters' required />
        </div>
    );
}

function PasswordPair({id, value}) {
    return (
        <div className='input_pair'>
            <label for={id}>{value}</label>
            <input type='password' name={id} id={id} className='inputs' />
        </div>
    );
}

function LoginButton({id, onButtonClick, value}) {
    return (
        <div className='center_login_buttons'>
            <button id={id} onclick={onButtonClick} className='submit_button'>{value}</button>
        </div>
    );
}
function Login() {
    return (
        <div>
            <h1>Othello</h1>

            <div id='login_container'>
                <div className='login_section'>
                    <h1>Login</h1>
                    <InputPair name='username' value='Username' type='text' />
                    <InputPair name='password' value='Password' type='password' />

                    {/*TODO change onclick function to new login function*/}
                    <LoginButton id='login_button' /*onclick={() => attemptLogin()}*/ value='Log In' />
                </div>
                <div className='login_section'>
                    <h1>Create Account</h1>
                    <InputPair name='create_username' value='Username' type='text' />
                    <PasswordPair name='create_password' value='Password' />

                    {/*TODO change onclick function to new add user function*/}
                    <LoginButton id='add_user_button' /*onclick={() => addNewUser()}*/ value='Create' />
                </div>
            </div>
        </div>
    );
}

export default Login;