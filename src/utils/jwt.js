const jwt = require('jsonwebtoken');

const generateToken = user => {
  const payload = {
    id: user._id.toString(),
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    age: user.age,
    role: user.role,
    cart: user.cart ? user.cart.toString() : null
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateResetToken = ({ id, email }) => {
  const payload = { id, email, purpose: 'password_reset' };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const verifyToken = token => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { generateToken, generateResetToken, verifyToken };