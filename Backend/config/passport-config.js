// Import passport and LocalStrategy from passport-local module. This to handle user authentication.
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// Import crypto module for hashing passwords. This to securely store and compare passwords.
const crypto = require("crypto");

// Import Bruker model from models directory. This to store data and use the table in the database.
const { Bruker } = require("../models");

// Define the LocalStrategy function. This to handle user authentication.
passport.use(
  new LocalStrategy(
    {
      // Change the deafult named fields to 'navn' and 'passord'. This is because it made it easyer for me to use the same field names as in the Bruker model.
      usernameField: "navn",
      passwordField: "passord",
    },
    // This async function is called when the user tries to login.
    async function (navn, passord, done) {
      try {
        // First it trys to find the user in the database using the 'navn' field.
        const user = await Bruker.findOne({ where: { navn } });

        // If the user is not found, it calls the done function with a false value and an error message.
        if (!user) {
          return done(null, false, {
            message: "Incorrect username or password.",
          });
        }

        // If the user is found, it generates a salt for the password using the crypto module and hashes the password using sha256 algorithm.
        // The salt is stored in the database and the hashed password is stored in the user object.
        crypto.pbkdf2(
          passord,
          user.salt,
          310000,
          32,
          "sha256",
          (err, hashedPassword) => {
            if (err) return done(err); // If there is an error during the hashing process, it calls the done function with the error.
            const storedHash = Buffer.from(user.passord, "hex"); // Convert the stored hash from a buffer to a string.

            // It compares the hashed password with the stored hash using the timingSafeEqual function from the crypto module.
            // If the password is wrong it calls the done function with a false value and the error messsage of incorrect password.
            if (!crypto.timingSafeEqual(storedHash, hashedPassword)) {
              return done(null, false, {
                message: "Incorrect username or password.",
              });
            }
            // If the password is correct it calls the done function with null value and the user object.
            return done(null, user);
          }
        );
      } catch (err) {
        // If there is an error during the hashing process, it calls the done function with the error.
        return done(err);
      }
    }
  )
);

// Serialize and deserialize the user object this for session management.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Bruker.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Export the configured Passport instance. This to be used in other parts of the application.
module.exports = passport;
