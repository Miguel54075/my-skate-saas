import jwt from 'jsonwebtoken';

// Verificação do Token JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Erro no formato do Token.' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Injeta os dados do usuário autenticado dentro da requisição
    req.user = {
      id: decoded.id,
      tenantId: decoded.tenantId,
      role: decoded.role,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

// Restrição por cargos (ADMIN, STAFF, CUSTOMER)
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Acesso negado. Você não tem permissão para realizar esta ação.' 
      });
    }
    return next();
  };
}

export { authMiddleware, authorizeRoles };