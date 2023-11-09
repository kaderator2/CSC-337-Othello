# Othello Web Application

## Overview
Our group members are Kade Dean, Andres Silva-Castellanos, and Elijah Parent. We will be making a web application that allows users to play the strategy game Othello (also known as Reversi). Othello involves placing black or white tiles (depending on the player) on a grid/board. Any tiles of the opposite color that end up between your newly-placed tile and another one of your tiles become your tiles. Players take turns placing one tile and flipping the corresponding tiles until there are no spaces left on the board. Whoever has the most tiles of their color on the board at the end wins the game. The starting state of the game has 2 tiles of each color at the center of the board in a checker pattern.

The site will allow users to create and log into accounts, play the game against a simple AI opponent or other players, customize their profile, and view a leaderboard. The leaderboard will rank players based on their rating points, which will increase or decrease after matches depending on the result and the relative rating of their opponent. A player’s rating will be displayed on their profile. They will also be able to view their past games, seeing each move that was made in order.

## Frontend
The first page that users will encounter is a login page where they will need to either create an account or log in. They will then reach a main menu where they can choose to play the game against other players or the AI, view their profile and recent games, or sign out. In the corner of the main menu, there will be a button with a “?” icon that displays helpful information for the use of the site. If they choose to play against other players, they will be placed on a temporary menu while they wait for an opponent, which simply has a button to dequeue. Upon matching with another queued player, they are placed into a match on a match page, which has an interactive game board in the middle, the user’s username, icon, rating points, and turn timer at the bottom, and the same information about their opponent at the top. When the match ends, the user returns to the main menu. The profile menu allows users to change their icon, as well as allowing them to view their current rating points and review their recent games. By clicking on one of these games, the user is sent to a page where they can view each move that was made in the match by clicking forward and back arrows.

## Backend
For this site, we will use Node.js with Express and Mongoose. Mongoose will connect to a MongoDB database, which will be structured as detailed in the next paragraph. We will use the React library to build our interface in a flexible and modular way. Two.js will be used to create adjustable and changing graphics for our game boards. The MongoDB database will have schemas for users, game board states, and match results. The user schema will hold usernames and salted/hashed passwords for user accounts. The game board state schema will hold a game ID, move count, and array representing the board state, to be used to track match state. The match result schema will contain a match ID, all of the game board states associated with that ID, the usernames of the players that were in the match, and their ratings. It will be used to hold games after they have happened, which will be used for the past games viewer functionality. We will need to support routes to the static site pages, as well as routes that will send user input from the login page, actions made on the game board, and information about other user interface interactions to the server.

## Timeline
By the end of the first week, we should have a functioning login system with salted and hashed passwords, pages built for each part of the site in HTML and CSS that link together correctly, and start work on the basic player versus AI gameplay. This will likely take around 20 hours altogether. In the second week, we will continue work on the basic AI to completion, and begin creating player versus player gameplay. This one is more volatile as we will be working with an unfamiliar graphics package and implementing the core game rules, but we are anticipating around 25 hours of work. In the third week, we will implement the majority of player versus player gameplay, finishing the core feature of the application. We will also add the rating points and leaderboard features. Because implementing player turns and the networking surrounding matchmaking may take a while to get working, we estimate this to take around 25 hours of work total. In week four, we will add the ability to go back and review previous games, the help menu, and any small remaining tasks. Between these features and polishing the site for its final version, we anticipate this to take around 20 hours of work.
