import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'universal-cookie';
import axios from 'axios';
const cookies = new Cookies();

const ProtectedRoutes = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = cookies.get('TOKEN');
        if (!token) {
            setIsLoggedIn(false);
        } else {
            const configuration = {
                method: 'get',
                url: 'http://localhost:5000/api/auth-endpoint',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            axios(configuration)
                .then((res) => {
                    setIsLoggedIn(true);
                })
                .catch((err) => {
                    setIsLoggedIn(false);
                });
        }
    }, []);

    return isLoggedIn ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoutes;
