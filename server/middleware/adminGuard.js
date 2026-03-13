const adminGuard = (req, res, next) => {
  const configuredKey = process.env.ADMIN_DEBUG_KEY;
  if (!configuredKey) return next();

  const provided = req.headers['x-admin-key'];
  if (provided !== configuredKey) {
    return res.status(403).json({ message: 'Admin key invalid' });
  }

  return next();
};

export default adminGuard;
