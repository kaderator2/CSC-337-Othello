import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'universal-cookie';
import axios from 'axios';
const cookies = new Cookies();

const ProtectedRoutes = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = cookies.get('TOKEN');
        if (!token) {
            setIsLoggedIn(false);
            setIsLoading(false);
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
                    setIsLoggedIn(true); // Assuming the response indicates successful authentication
                })
                .catch((err) => {
                    setIsLoggedIn(false); // Failed authentication
                })
                .finally(() => {
                    setIsLoading(false); // Set loading state to false after request completion
                });
        }
    }, []);

    if (isLoading) {
        return <div>Loading...</div>; // Render loading indicator while checking authentication
    }

    if (isLoggedIn === false) {
        return <Navigate to="/" />;
    }

    // Once the authentication check is complete and successful,
    // render the child routes using Outlet
    return <Outlet />;
};

export default ProtectedRoutes;
