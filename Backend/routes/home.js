// Imports the 'express' module and creates a new router instance. This to use the router to handle HTTP requests.
const express = require("express");
const router = express.Router();

// Makes a route to test if the api is up and running. This route will be accessed at http://localhost:5000/api/home.
router.get("/", (req, res) => {
  // Responds with a JSON object containing a welcome message.
  res.json({ message: "Welcome to the KLP Bank API!" });
});

// Exports the router instance to be used in the main route.
module.exports = router;
