// Imports the 'express' module and creates a new router instance. This to use the router to handle HTTP requests.
const express = require("express");
const router = express.Router();

// Imports 'bankkonto' and 'transaksjon' models from the '../models. This to be able to use them in the router.
const { Bankkonto, Transaksjon } = require("../models");

// Makes a ascync function to apply interest on all sparekonto accounts.
const applyInterest = async () => {
  // Makes the constant variables of the intrest and monthly rate.
  const interestRate = 0.04;
  const monthlyRate = interestRate / 12;

  // Fetches all sparekonto accounts from the database.
  const sparekontoAccounts = await Bankkonto.findAll({
    where: { kontotype: "sparekonto" },
  });

  // Iterates over each sparekonto account and applies interest.
  for (const account of sparekontoAccounts) {
    const interest = parseFloat(account.saldo) * monthlyRate;
    account.saldo = parseFloat(account.saldo) + interest;
    await account.save();

    // Creates a new transaksjon for the interest.
    await Transaksjon.create({
      bankkontoId: account.id,
      kontonummer: account.kontonummer,
      type: "deposit",
      belop: interest,
      nySaldo: account.saldo,
    });
  }
};

// Sets up a timer to apply interest every 15 minutes. - it's set in miliseconds.
setInterval(applyInterest, 900000);

// Makes a route with a '/deposit' post request handler. This to handle deposit requests.
router.post("/deposit", async (req, res) => {
  try {
    // Gets the kontonummer and belop from the request body. - it's set in JSON format.
    const { kontonummer, belop } = req.body;

    // Finds the bankkonto with the given kontonummer. If it dosen't exist, it returns a 404 error.
    const account = await Bankkonto.findOne({ where: { kontonummer } });
    if (!account) return res.status(404).json({ error: "Account not found" });

    // Checks if the account type is bsu.
    if (account.kontotype === "bsu") {
      // Makes the constent variables of the anual limits and the total limit.
      const annualLimit = 27500;
      const totalLimit = 300000;

      // Finds all transaksjoner for the account. Then sums it up to get the total belop of all deposits.
      // If the sum methode returns null, it means there are no transaksjoner yet. So it gets setto 0.

      const depositsThisYear =
        (await Transaksjon.sum("belop", {
          where: {
            bankkontoId: account.id,
            type: "deposit",
          },
        })) || 0;

      // Checks if the belop is within the annual limit. If it is, it proceeds with the deposit
      if (Number(depositsThisYear) + Number(belop) > annualLimit) {
        return res.status(400).json({
          error: `Annual deposit limit of ${annualLimit} exceeded for BSU.`,
        });
      }

      // Checks if the total balance for the account exceeds the annual limit. If it does, it returns an error.
      if (Number(account.saldo) + Number(belop) > totalLimit) {
        return res.status(400).json({
          error: `Total balance for BSU cannot exceed ${totalLimit}.`,
        });
      }
    }

    // Sets the account balance to the current balance plus the deposit amount. Also it sets the newbalance to this value too. - Then its saves account.
    account.saldo = parseFloat(account.saldo) + parseFloat(belop);
    newBalance = parseFloat(account.saldo);
    await account.save();

    // Makes a new transaction entry in the database with the deposit details. - Then it returns a success message and the updated account information.
    await Transaksjon.create({
      bankkontoId: account.id,
      kontonummer,
      type: "deposit",
      belop,
      nySaldo: newBalance,
    });
    res.json({ message: "Deposit successful", account });
  } catch (err) {
    // If there is an error, it returns a 500 error with the error message.
    res.status(500).json({ error: err.message });
  }
});

// Makes a route with a '/withdraw' post request handler. This to handle withdraw requests.
router.post("/withdraw", async (req, res) => {
  try {
    // Cheaks if the user is authenticated. If not, it returns a 401 error with the message 'Not authenticated'.
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Gets the 'kontonummer' and 'belop' from the request body. - Then it gets the account with the 'kontonummer' from the database.
    const { kontonummer, belop } = req.body;
    const account = await Bankkonto.findOne({ where: { kontonummer } });

    // Cheaks if the account exists and if the user has enough funds to withdraw. 
    // If not, it returns a 404 error with the message 'Account not found' and a 400 error with the message 'Insufficient funds'.
    if (!account) return res.status(404).json({ error: "Account not found" });
    if (parseFloat(account.saldo) < parseFloat(belop)) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    // Sets the account balance to the current balance minus the withdrawal amount. Also it sets the newbalance to this value too. - Then its saves account.
    account.saldo = parseFloat(account.saldo) - parseFloat(belop);
    newBalance = parseFloat(account.saldo);
    await account.save();

    // Makes a new transaction entry in the database with the withdraw details. - Then it returns a success message and the updated account information.
    await Transaksjon.create({
      bankkontoId: account.id,
      kontonummer,
      type: "withdraw",
      belop,
      nySaldo: newBalance,
    });
    res.json({ message: "Withdrawal successful", account });
  } catch (err) {
    // If there is an error, it returns a 500 error with the error message.
    res.status(500).json({ error: err.message });
  }
});

// Makes a route with a '/history/ and the kontonummer' get request handler. This to see the konto history of the '/kontonummer' provided.
router.get("/history/:kontonummer", async (req, res) => {
  try {
    // Cheaks if the user is authenticated. If not, it returns a 401 error with the message 'Not authenticated'.
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Gets the 'kontonummer' from the url. - Then it gets the authenticated users with the 'kontonummer' from the database.
    const account = await Bankkonto.findOne({
      where: {
        kontonummer: req.params.kontonummer,
        brukerId: req.user.id,
      },
      include: [
        {
          // It includes the account transactions. It orders them by date in descending order and limits the result to 30 transactions.
          model: Transaksjon,
          order: [["dato", "DESC"]],
          limit: 30,
        },
      ],
    });

    // If the account is not found, it returns a 404 error with the message 'Account not found'.
    if (!account) return res.status(404).json({ error: "Account not found" });

    // If the account is found, it returns the account transactions.
    res.json(account.Transaksjons);
  } catch (error) {
    // If there is an error, it logs the error and returns a 500 error with the message 'Server error'.
    console.error("Transaction history error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Makes a route with a '/balance-history/ and the kontonummer' get request handler. This to see the balance history of the '/kontonummer' provided.
router.get("/balance-history/:kontonummer", async (req, res) => {
  try {
    // Cheaks if the user is authenticated. If not, it returns a 401 error with the message 'Not authenticated'.
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Gets all transactions for the authenticated user with the 'kontonummer' provided. - This get sorted by date in ascending order.
    const transactions = await Transaksjon.findAll({
      include: [
        {
          model: Bankkonto,
          where: {
            kontonummer: req.params.kontonummer,
            brukerId: req.user.id,
          },
        },
      ],
      order: [["dato", "ASC"]],
      attributes: ["dato", "nySaldo"],
    });

    // This iterates over each transaction in the transactions array.
    const balanceHistory = transactions.map((t) => ({
      date: t.dato.toISOString().split("T")[0], // Converts the date to a string in 'YYYY-MM-DD' format (example: '2023-10-05').
      balance: t.nySaldo, // The saldo in transaction is the new balance in the balance history.
    }));

    // This sends the balance history as a JSON response to the client.
    res.json(balanceHistory);
  } catch (error) {
    // If an error occurs during the transaction retrieval, it logs the error and sends a 500 status code with an error message.
    console.error("Balance history error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Exports the router instance to be used in the main route.
module.exports = router;
