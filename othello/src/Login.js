import React from 'react';

function InputPair({id, value, type}) {
    return (
        <div class='input_pair'>
            <label for={id}>{value}</label>
            <input type={type} name={id} id={id} class='inputs' pattern='.{8,}'
                title='Eight or more characters' required />
        </div>
    );
}

function PasswordPair({id, value}) {
    return (
        <div class='input_pair'>
            <label for={id}>{value}</label>
            <input type='password' name={id} id={id} class='inputs' />
        </div>
    );
}

function LoginButton({id, onButtonClick, value}) {
    return (
        <div class='center_login_buttons'>
            <button id={id} onclick={onButtonClick} class='submit_button'>{value}</button>
        </div>
    );
}
function Login() {
    return (
        <div>
            <h1>Othello</h1>

            <h1>Login</h1>
            <InputPair name='username' value='Username' type='text' />
            <InputPair name='password' value='Password' type='password' />

            {/*TODO change onclick function to new login function*/}
            <LoginButton id='login_button' /*onclick={() => attemptLogin()}*/ value='Log In' />

            <h1>Create Account</h1>
            <InputPair name='create_username' value='Username' type='text' />
            <PasswordPair name='create_password' value='Password' />

            {/*TODO change onclick function to new add user function*/}
            <LoginButton id='add_user_button' /*onclick={() => addNewUser()}*/ value='Create' />
        </div>
    );
}

export default Login;