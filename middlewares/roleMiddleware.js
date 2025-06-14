module.exports = (role) => (req, res, next) => {
  if (req.user?.tipo_usuario === role) return next();
  res.status(403).json({ mensagem: 'Acesso negado' });
};