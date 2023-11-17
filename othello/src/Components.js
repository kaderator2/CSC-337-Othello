import React from 'react';
import { useNavigate } from "react-router-dom";

export function Header ({value}) {
    return (
        <div className='main_header'>
            <h1>{value}</h1>
        </div>
    );
}

export function BackButton() {
    let navigate = useNavigate();
    const goToHome = () => { 
        navigate('/home');
    }

    return (
        <div className='back_button_wrapper'>
            <button onClick={goToHome} className='back_button'>Back</button>
        </div>
    );
}

export default Header("test");