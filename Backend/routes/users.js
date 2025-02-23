// Imports the 'express' module and creates a new router instance. This to use the router to handle HTTP requests.
const express = require("express");
const router = express.Router();

// Imports 'crypto' and 'passport' modules. These to be able to use them in the router.
const crypto = require("crypto");
const passport = require("passport");

// Imports 'bankkonto' and 'Bruker' models from the '../models. This to be able to use them in the router.
const { Bruker, Bankkonto } = require("../models");

// Makes a route with a '/register' post request handler. This to register a new user.
router.post("/register", async (req, res) => {
  try {
    // Gets the 'navn' and 'passord' from the request body.
    const { navn, passord } = req.body;

    // Generates a random salt and hashes the password using PBKDF2. This to be able to securely store the password.
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(
      passord,
      salt,
      310000,
      32,
      "sha256",

      // Callback function that is called when the password has been hashed.
      async (err, hashedPassword) => {
        // If there is an error, return a 500 status code with the error message.
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Makes the hash password into a hexadecimal string and creates a new Bruker object with the 'navn', 'passord' and 'salt'. This to be able to store the user in the database.
        const hashedPassHex = hashedPassword.toString("hex");
        try {
          const newUser = await Bruker.create({
            navn,
            passord: hashedPassHex,
            salt,
          });

          // Creates a new Bankkonto number thats random from 1.000.000.000 to 9.000.000.000. - Then converts it to a string
          let bankKontoNumber = Math.floor(
            1000000000 + Math.random() * 9000000000
          ).toString();
          const kontonummer = `${bankKontoNumber}`;

          // Creates a new Bankkonto with the 'kontonummer', 'saldo' and 'brukerId'. This to be able to store the bankkonto in the database.
          await Bankkonto.create({
            kontonummer,
            saldo: 1000.0,
            brukerId: newUser.id,
          });

          // Sends a JSON response with the new user object and a success message.
          res.json({ message: "User registered successfully", user: newUser });
        } catch (createErr) {
          // If there is an error when creating the new user, return a 500 status code with an error message.
          res.status(500).json({ error: createErr.message });
        }
      }
    );
  } catch (err) {
    // If there is an error, return a 500 status code with the error message.
    res.status(500).json({ error: err.message });
  }
});

// Makes a route with a '/login' post request handler. This to authenticate the current user with their username and password. This is done using Passport.js middleware.
router.post("/login", passport.authenticate("local"), (req, res) => {
  // If the authentication is successful, send a JSON response with the user object and a success message.
  res.json({ message: "Login successful", user: req.user });
});

// Makes a route with a '/logout' post request handler. This to log out the current user from their session. This is done using Passport.js middleware.
router.post("/logout", (req, res, next) => {
  // If there is an error during logout, pass it to the next middleware. Otherwise, log out the user and send a JSON response with a success message.
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.json({ message: "Logged out successfully" });
  });
});

// Exports the router instance to be used in the main route.
module.exports = router;
