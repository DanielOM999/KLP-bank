// Import the 'express' and 'express-session' libraries to make the server handle HTTP request, api calls and routes.
// In addition response handling, and to manage user sessions effectively.
const express = require("express");
const session = require("express-session");

// Import the 'cors' and 'dotenv' libraries to manage the server's environment variables and CORS policies.
const cors = require("cors");
require("dotenv").config();

// Import 'syncDatabase' from my own file sync.js, this is used to connect to the database and sync the schema.
const syncDatabase = require("./sync");

// Import 'passport' and my own 'passport-config' file to configure the passport authentication system, and make a easy and reusable authentication system.
const passport = require("passport");
require("./config/passport-config");

// Create an instance of the Express application and set the port number.
const app = express();
const PORT = process.env.PORT || 5000; // Sets port to 5000 if not specified in environment variables.

// Setup the Middleware to handle JSON and URL-encoded data. (example: JSON data sent in POST or GET requests like {name: 'John', age: 30})
app.use(express.json());

// Setup middleware to handle URL-encoded data and more complex at that. (example: form data sent in POST requests like {name: 'John', ages: [30, 25] // more complex part})
app.use(express.urlencoded({ extended: true }));

// Setup 'CORS' to enable request from different origins or domains. (example: localhost:3000 or vg.no)
// Here is localhost:3000 the origin that is allowed to make requests. In addition is credetials allowed,
// so data like cookies can be sent back and forth to authenticate users.
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Setup session middleware to handle user sessions. (example: so a user can login and logout and keep track of their session).
// Gets the secret key used to secure these session ID for users, from the environment variables.
// The resave and saveUninitialized options are used to control whether the session should be saved after each request or
// if it should be created if it doesn't exist. In this case, they are set to true. Maybe not a smart choice for production, but it's fine for development..
app.use(
  session({
    secret: process.env.SECRETKEY,
    resave: true,
    saveUninitialized: true,
  })
);

// Setup passport middleware to handle user authentication. (example: so a user can login and logout and keep track of their session).
app.use(passport.initialize());
app.use(passport.session());

// Define routes for the application. This is the main route that imports all the rest of my routes under '/api'.
const main = require("./routes/main");

// Run the syncDatabase function to sync the database and starts the server and use the main route in a promisse chain.
syncDatabase()
  .then(() => {
    console.log("Starting the server...");
    app.use("/api", main);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error syncing database, server not started:", error);
  });
