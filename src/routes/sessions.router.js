const { Router } = require('express');
const passport = require('passport');
const { generateToken } = require('../utils/jwt');

const router = Router();

router.post('/register', passport.authenticate('register', { session: false }), async (req, res) => {
  res.status(201).json({ status: 'success' });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('login', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ status: 'error', error: 'Credenciales inválidas' });

    const token = generateToken(user);
    res.json({ status: 'success', token });
  })(req, res, next);
});

router.get('/current', passport.authenticate('current', { session: false }), (req, res) => {
  res.json({ status: 'success', payload: req.user });
});

module.exports = router;