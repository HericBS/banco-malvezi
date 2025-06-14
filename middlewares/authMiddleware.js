const { validarToken } = require('../utils/jwtUtils');

module.exports = (roles = []) => (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ mensagem: 'Token não fornecido' });

  const user = validarToken(token);
  if (!user) return res.status(401).json({ mensagem: 'Token inválido' });

  if (roles.length > 0 && !roles.includes(user.tipo_usuario)) {
    return res.status(403).json({ mensagem: 'Acesso negado' });
  }

  req.user = user;
  next();
};