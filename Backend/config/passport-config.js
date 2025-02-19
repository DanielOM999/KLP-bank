const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const { Bruker } = require("../models");

passport.use(new LocalStrategy(
  {
    usernameField: 'navn',
    passwordField: 'passord',
  },
  async function(navn, passord, done) {
    try {
      const user = await Bruker.findOne({ where: { navn } });
      if (!user) {
        return done(null, false, { message: "Incorrect username or password." });
      }
      crypto.pbkdf2(passord, user.salt, 310000, 32, 'sha256', (err, hashedPassword) => {
        if (err) return done(err);
        const storedHash = Buffer.from(user.passord, 'hex');
        if (!crypto.timingSafeEqual(storedHash, hashedPassword)) {
          return done(null, false, { message: "Incorrect username or password." });
        }
        return done(null, user);
      });
    } catch (err) {
      return done(err);
    }
  }
));

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

module.exports = passport;
