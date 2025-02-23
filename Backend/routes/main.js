// Imports the 'express' module and creates a new router instance. This to use the router to handle HTTP requests.
const express = require("express");
const router = express.Router();

// Defines all the api routes.
const homeRoutes = require("./home");
const userRoutes = require("./users");
const accountRoutes = require("./bankkonto");
const transactionRoutes = require("./transaction");
const current = require("./current");

// Use all the routes and sett all there indevidual locations (example: /api/home).
router.use("/home", homeRoutes);
router.use("/users", userRoutes);
router.use("/account", accountRoutes);
router.use("/transaction", transactionRoutes);
router.use("/current", current);

// Exports the router instance to be used in server.js and add all the diffrent /api routes.
module.exports = router;
