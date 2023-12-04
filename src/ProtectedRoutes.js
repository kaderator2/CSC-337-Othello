/*
 * CSC 337 - Final Project - Elijah Parent, Kade Dean, Andres Silva-Castellanos
 * This file contains the react router for all of the authenticated pages in the frontend.
 */

import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'universal-cookie';
import axios from 'axios';
const cookies = new Cookies();

/*
This component is used to check if the user is authenticated before rendering the child routes.
*/
const ProtectedRoutes = () => {
    // Set the initial logged state to true
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // Set the initial loading state to true
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = cookies.get('TOKEN');
        if (!token) {
            // If the token is not present in the cookies, set the loading state to false
            setIsLoggedIn(false);
            setIsLoading(false);
        } else {
            // If the token is present in the cookies, make a request to the auth endpoint
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
        console.log("You are not authenticated!");
        return <Navigate to="/" />; // Redirect to login page if not authenticated
    }

    // Once the authentication check is complete and successful,
    // render the child routes using Outlet
    return <Outlet />;
};

export default ProtectedRoutes;
