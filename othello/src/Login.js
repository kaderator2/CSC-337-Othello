import React, { useState } from 'react';
import Default, { Header } from './Components'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function InputPair({ id, value, type, onChange }) {
    return (
        <div className='input_pair'>
            <label htmlFor={id}>{value}</label>
            <input type={type} name={id} id={id} className='inputs' pattern='.{8,}'
                title='Eight or more characters' required onChange={onChange} />
        </div>
    );
}

function LoginButton({ id, onButtonClick, value }) {
    return (
        <div className='center_login_buttons'>
            <button id={id} onClick={onButtonClick} className='submit_button'>{value}</button>
        </div>
    );
}

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const navigate = useNavigate();
    const attemptLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/login/', { username: username, password: password });
            if (response.data.redirectURL) {
                navigate('/home');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const createAccount = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/add/user', { username: newUsername, password: newPassword });
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <Header value='Othello' />

            <div className='centered_container'>
                <div className='login_section centered_section'>
                    <h1>Login</h1>
                    <InputPair id='username' value='Username' type='text' onChange={e => setUsername(e.target.value)} />
                    <InputPair id='password' value='Password' type='password' onChange={e => setPassword(e.target.value)} />

                    <LoginButton id='login_button' onButtonClick={attemptLogin} value='Log In' />
                </div>
                <div className='login_section centered_section'>
                    <h1>Create Account</h1>
                    <InputPair id='create_username' value='Username' type='text' onChange={e => setNewUsername(e.target.value)} />
                    <InputPair id='create_password' value='Password' type='password' onChange={e => setNewPassword(e.target.value)} />

                    <LoginButton id='add_user_button' onButtonClick={createAccount} value='Create' />
                </div>
            </div>
        </div>
    );
}

export default Login;