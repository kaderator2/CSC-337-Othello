# Othello Web Application

**Authors:** Kade Dean, Andres Silva-Castellanos, Elijah Parent

## Overview

Our web application allows users to play the strategy game Othello (Reversi). The game involves placing black or white tiles on a grid, with the goal of capturing your opponent's tiles. Players take turns placing tiles, and the one with the most tiles of their color on the board wins. You can create an account, play against an AI opponent or other players, customize your profile, and check out the leaderboard.

## Frontend

Upon logging in or creating an account, you'll access the main menu, where you can play against other players or the AI, view your profile and recent games, or sign out. The match page features an interactive game board, your username, icon, rating points, and turn timer. After a match ends, you return to the main menu. The profile menu allows you to change your icon, view your rating points, and review past games.

## Backend

Our site is built using Node.js with Express and Mongoose for database connections. MongoDB holds user data, game board states, and match results. The React library ensures a flexible and modular interface. Two.js creates adjustable and changing graphics for the game boards. The database stores user data, game states, and match results for viewing past games.
