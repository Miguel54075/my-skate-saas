import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

// Gerador de Token JWT
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      tenantId: user.tenantId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

class AuthController {
  // Criar uma nova Hamburgueria + Conta do Dono (SaaS Onboarding)
  async registerTenant(req, res) {
    try {
      const { tenantName, slug, name, email, password, phone } = req.body;

      if (!tenantName || !slug || !email || !password) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
      }

      const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
      if (existingTenant) {
        return res.status(400).json({ error: 'Este slug/endereço já está em uso por outro restaurante.' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            name: tenantName,
            slug: slug.toLowerCase().replace(/\s+/g, '-'),
            phone,
          },
        });

        const user = await tx.user.create({
          data: {
            tenantId: tenant.id,
            name,
            email,
            password: passwordHash,
            role: 'ADMIN',
          },
        });

        return { tenant, user };
      });

      const token = generateToken(result.user);

      return res.status(201).json({
        message: 'Hamburgueria e conta cadastradas com sucesso!',
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          slug: result.tenant.slug,
        },
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
        token,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao cadastrar hamburgueria.' });
    }
  }

  // Login de Usuários
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true },
      });

      if (!user) {
        return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
      }

      const token = generateToken(user);

      return res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenant: user.tenant
            ? {
                id: user.tenant.id,
                name: user.tenant.name,
                slug: user.tenant.slug,
              }
            : null,
        },
        token,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao realizar login.' });
    }
  }

  // Perfil do Usuário
  async me(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              primaryColor: true,
            },
          },
        },
      });

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar perfil.' });
    }
  }
}

export default new AuthController();