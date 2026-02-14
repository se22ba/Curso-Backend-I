const { Router } = require('express');
const passport = require('passport');

const UsersRepository = require('../repositories/users.repository');
const { generateToken, generateResetToken, verifyToken } = require('../utils/jwt');
const { createHash, isValidPassword } = require('../utils/hash');
const UserCurrentDTO = require('../dtos/userCurrent.dto');
const MailingService = require('../services/mailing.service');

const router = Router();

const cookieOptions = () => {
  const secure =
    process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000
  };
};

router.post('/register', passport.authenticate('register', { session: false }), async (req, res) => {
  res.status(201).json({ status: 'success' });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('login', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ status: 'error', error: 'Credenciales inválidas' });

    const token = generateToken(user);
    res.cookie('token', token, cookieOptions());
    res.json({ status: 'success' });
  })(req, res, next);
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ status: 'success' });
});

router.get('/current', passport.authenticate('current', { session: false }), (req, res) => {
  const dto = new UserCurrentDTO(req.user);
  res.json({ status: 'success', payload: dto });
});

router.post('/forgot-password', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ status: 'error', error: 'Email requerido' });

    const usersRepo = new UsersRepository();
    const user = await usersRepo.findByEmail(email);

    if (user) {
      const token = generateResetToken({ id: user._id.toString(), email: user.email });
      const baseUrl = process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 8080}`;
      const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

      const mailer = new MailingService();
      await mailer.sendPasswordReset(user.email, resetUrl);
    }

    res.json({ status: 'success', message: 'Si el email existe, se envió el enlace de recuperación' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: 'Error al solicitar recuperación' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const token = req.body.token;
    const newPassword = req.body.newPassword;

    if (!token || !newPassword) {
      return res.status(400).json({ status: 'error', error: 'Token y newPassword requeridos' });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.purpose !== 'password_reset') {
      return res.status(400).json({ status: 'error', error: 'Token inválido' });
    }

    const usersRepo = new UsersRepository();
    const user = await usersRepo.findByIdWithPassword(decoded.id);
    if (!user) return res.status(404).json({ status: 'error', error: 'Usuario no encontrado' });

    if (isValidPassword(user, newPassword)) {
      return res.status(400).json({ status: 'error', error: 'La nueva contraseña no puede ser igual a la anterior' });
    }

    const hashed = createHash(newPassword);
    await usersRepo.updatePassword(user._id.toString(), hashed);

    res.json({ status: 'success' });
  } catch (err) {
    res.status(400).json({ status: 'error', error: 'Token expirado o inválido' });
  }
});

module.exports = router;