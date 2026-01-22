const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../dao/models/user.model');
const Cart = require('../dao/models/cart.model');
const { createHash, isValidPassword } = require('../utils/hash');

const initializePassport = () => {
  passport.use(
    'register',
    new LocalStrategy(
      { usernameField: 'email', passReqToCallback: true },
      async (req, email, password, done) => {
        try {
          const exists = await User.findOne({ email });
          if (exists) return done(null, false);

          const cart = await Cart.create({ products: [] });

          const user = await User.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email,
            age: req.body.age,
            password: createHash(password),
            cart: cart._id,
            role: req.body.role || 'user'
          });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.use(
    'login',
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false);
        if (!isValidPassword(user, password)) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.use(
    'current',
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
      },
      async (payload, done) => {
        try {
          const user = await User.findById(payload.id).select('-password').lean();
          if (!user) return done(null, false);
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};

module.exports = initializePassport;