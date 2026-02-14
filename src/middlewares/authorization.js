const authorizeRole = (...roles) => {
  const allowed = roles.map(r => String(r).toLowerCase());
  return (req, res, next) => {
    const role = (req.user && req.user.role ? String(req.user.role) : '').toLowerCase();
    if (!role) return res.status(401).json({ status: 'error', error: 'No autenticado' });
    if (!allowed.includes(role)) return res.status(403).json({ status: 'error', error: 'No autorizado' });
    next();
  };
};

const authorizeCartOwnerUser = () => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ status: 'error', error: 'No autenticado' });

    const role = (req.user.role || '').toLowerCase();
    if (role !== 'user') return res.status(403).json({ status: 'error', error: 'No autorizado' });

    const userCart = req.user.cart ? String(req.user.cart) : null;
    const cid = String(req.params.cid);
    if (!userCart || userCart !== cid) {
      return res.status(403).json({ status: 'error', error: 'Carrito no autorizado' });
    }

    next();
  };
};

module.exports = { authorizeRole, authorizeCartOwnerUser };