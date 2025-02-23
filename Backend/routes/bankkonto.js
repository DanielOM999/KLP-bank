// Imports the 'express' module and creates a new router instance. This to use the router to handle HTTP requests.
const express = require("express");
const router = express.Router();

// Imports 'bankkonto' and 'Bruker' models from the '../models. This to be able to use them in the router.
const { Bankkonto, Bruker } = require("../models");

// Makes a route with a '/create' post request handler. This to create a new bank account
router.post("/create", async (req, res) => {
  // Cheaks if the current user acessing the route is authenticated.
  if (req.isAuthenticated()) {
    try {
      // Gets the user ID from the authenticated session. Then use that to find the user in the database.
      const userID = req.user.id;
      const user = await Bruker.findByPk(userID);

      // if there is no user found in the database, it returns a 404 error.
      if (!user) return res.status(404).json({ error: "User not found" });

      // Generates a unique bank account number. This is done by multiplying a random number with 9000000000 and then converting it to a string.
      // Then you get a number between '1.000.000.000' and '9.000.000.000'.
      const bankKontoNumber = Math.floor(
        1000000000 + Math.random() * 9000000000
      ).toString();
      const kontonummer = bankKontoNumber;

      // Gets the kontotype from the request body. If it is not provided, it defaults to "standard".
      const { kontotype } = req.body;

      // Creates a new bank account in the database.
      const newAccount = await Bankkonto.create({
        kontonummer,
        saldo: 0.0,
        brukerId: userID,
        kontotype: kontotype || "standard",
      });

      // Sends a response with the new bank account details. The response includes the ID, kontonummer, saldo, and kontotype of the new bank account.
      res.json({
        id: newAccount.id,
        kontonummer: newAccount.kontonummer,
        saldo: newAccount.saldo,
        kontotype: newAccount.kontotype,
      });
    } catch (err) {
      // If an error occurs during the creation of the new bank account, it sends a response with a status code of 500 and the error message.
      res.status(500).json({ error: err.message });
    }
  } else {
    // If the user is not authenticated, it sends a response with a status code of 401 and an error message.
    res.json({ error: "Not authenticated" });
  }
});

// Makes a route with a '/balance/ and kontomuber' get request handler. This to get the balance of a bank account specifyed after the '/balance/' path.
router.get("/balance/:kontonummer", async (req, res) => {
  try {
    // Gets the kontonummer from the request parameters. This is used to find the bank account with that specific kontonummer.
    const { kontonummer } = req.params;
    const account = await Bankkonto.findOne({ where: { kontonummer } });

    // If the bank account is not found, it sends a response with a status code of 404 and an error message.
    if (!account) return res.status(404).json({ error: "Account not found" });

    // It returns the balance of the bank account in JSON format.
    res.json({ balance: account.saldo });
  } catch (err) {
    // If an error occurs during the retrieval of the bank account balance, it sends a response with a status code of 500 and an error message.
    res.status(500).json({ error: err.message });
  }
});

// Exports the router instance to be used in the main route.
module.exports = router;
