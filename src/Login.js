/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * This file contains the login page for the frontend.
 */

import React, { useState } from 'react';
import Default, { Header } from './Components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

/*
This component is used to render the input fields for the login page.

id: The id of the input field
value: The label for the input field
type: The type of the input field
onChange: The function to call when the input field changes
*/
function InputPair({ id, value, type, onChange }) {
    return (
        <div className='input_pair'>
            <label htmlFor={id}>{value}</label>
            <input
                type={type}
                name={id}
                id={id}
                className='inputs'
                pattern='.{8,}'
                title='Eight or more characters'
                required
                onChange={onChange}
            />
        </div>
    );
}

/*
This component is used to render the login button.

id: The id of the button
onButtonClick: The function to call when the button is clicked
value: The text to display on the button
*/
function LoginButton({ id, onButtonClick, value }) {
    return (
        <div className='center_login_buttons'>
            <button id={id} onClick={onButtonClick} className='submit_button'>
                {value}
            </button>
        </div>
    );
}

/*
This component is used to render the login page.
*/
function Login() {
    // state variables for the login page
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [errorMessages, setErrorMessages] = useState('');

    // function to attempt to login
    const attemptLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/login/', {
                username: username,
                password: password,
            }, { withCredentials: true, credentials: 'include' });
            if (response.data.message === 'Login Successful') {
                // set the cookie
                cookies.set('TOKEN', response.data.token, {
                    path: '/',
                });
                // set username cookie
                cookies.set('name', username, { path: '/' });

                // redirect user to the auth page
                window.location.href = '/home';
            }
        } catch (error) {
            // if there is an error, display it
            console.error(error);
            setErrorMessages(error.response.data.message);
        }
    };

    // function to create an account
    const createAccount = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/add/user', {
                username: newUsername,
                password: newPassword,
                rating: 800
            });
            console.log(response.data);
        } catch (error) {
            console.error(error);
            setErrorMessages(error.response.data.message);
        }
    };

    return (
        <div>
            <Header value='Othello' />

            <div className='centered_container'>
                <div className='login_section centered_section'>
                    <h1>Login</h1>
                    <InputPair id='username' value='Username' type='text' onChange={(e) => setUsername(e.target.value)} />
                    <InputPair id='password' value='Password' type='password' onChange={(e) => setPassword(e.target.value)} />

                    <LoginButton id='login_button' onButtonClick={attemptLogin} value='Log In' />
                </div>
                <div className='login_section centered_section'>
                    <h1>Create Account</h1>
                    <InputPair id='create_username' value='Username' type='text' onChange={(e) => setNewUsername(e.target.value)} />
                    <InputPair id='create_password' value='Password' type='password' onChange={(e) => setNewPassword(e.target.value)} />

                    <LoginButton id='add_user_button' onButtonClick={createAccount} value='Create' />
                </div>
                {errorMessages && <p className='error-message'>{errorMessages}</p>}
            </div>
        </div>
    );
}

export default Login;