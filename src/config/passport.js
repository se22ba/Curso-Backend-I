const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;

const UsersRepository = require('../repositories/users.repository');
const CartsRepository = require('../repositories/carts.repository');
const { createHash, isValidPassword } = require('../utils/hash');

const cookieExtractor = req => {
  if (!req || !req.cookies) return null;
  return req.cookies.token || null;
};

const initializePassport = () => {
  const usersRepo = new UsersRepository();
  const cartsRepo = new CartsRepository();

  passport.use(
    'register',
    new LocalStrategy(
      { usernameField: 'email', passReqToCallback: true },
      async (req, email, password, done) => {
        try {
          const exists = await usersRepo.findByEmail(email);
          if (exists) return done(null, false);

          const cart = await cartsRepo.createEmpty();

          const user = await usersRepo.create({
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
        const user = await usersRepo.findByEmailWithPassword(email);
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
        jwtFromRequest: cookieExtractor,
        secretOrKey: process.env.JWT_SECRET
      },
      async (payload, done) => {
        try {
          const user = await usersRepo.findByIdSafe(payload.id);
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