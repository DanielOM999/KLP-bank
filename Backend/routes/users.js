const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const passport = require("passport");
const { Bruker, Bankkonto } = require("../models");

router.post("/register", async (req, res) => {
  try {
    const { navn, passord } = req.body;
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(passord, salt, 310000, 32, 'sha256', async (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const hashedPassHex = hashedPassword.toString('hex');
      try {
        const newUser = await Bruker.create({
          navn,
          passord: hashedPassHex,
          salt,
        });

        let bankKontoNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString()
        const kontonummer = `${bankKontoNumber}`;
        await Bankkonto.create({
          kontonummer,
          saldo: 1000.00,
          brukerId: newUser.id,
        });
        
        res.json({ message: "User registered successfully", user: newUser });
      } catch (createErr) {
        res.status(500).json({ error: createErr.message });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ message: "Login successful", user: req.user });
});

router.post("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) { return next(err); }
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;
