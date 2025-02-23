// Imports the 'express' module and creates a new router instance. This to use the router to handle HTTP requests.
const express = require("express");
const router = express.Router();

// Imports 'bankkonto' and 'Bruker' models from the '../models. This to be able to use them in the router.
const { Bruker, Bankkonto } = require("../models");

// Route to fetch the current user and their bank accounts
router.get("/", async (req, res) => {
  // Cheaks if the current user acessing the route is authenticated.
  if (req.isAuthenticated()) {
    try {
      // Finds the current authenticated user and their bank accounts in the database.
      const userWithBankAccounts = await Bruker.findByPk(req.user.id, {
        include: [
          {
            // include the Bankkonto model and specifies the attributes to be retrieved.
            model: Bankkonto,
            attributes: ["id", "kontonummer", "saldo", "kontotype"],

            // includes them one at a time and orders them by creation date in ascending order.
            separate: true,
            order: [["createdAt", "ASC"]],
          },
        ],
      });

      // Returns the user and their bank accounts as JSON response.
      res.json({ user: userWithBankAccounts });
    } catch (error) {
      // If an error occurs it logs the error and returns a 500 status code with an error message.
      console.error("Error fetching user with bank accounts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    // If the user is not authenticated it logs a message and returns a 401 status code with an error message.
    res.json({ error: "Not authenticated" });
  }
});

// Exports the router instance to be used in the main route.
module.exports = router;
