import { Router } from 'express';
import { prisma } from '../../database/prisma';

const authRouter = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autentica um usuário
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 */
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.usuario.findUnique({
        where: { email },
    });

    if (!user || user.senhaHash !== password) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // In a real application, you would generate a JWT token here
    const token = 'fake-jwt-token';

    res.json({ token, lojaId: user.lojaId, usuarioId: user.id });
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     responses:
 *       200:
 *         description: Registro bem-sucedido
 */
authRouter.post('/register', (req, res) => {
    res.json({ message: 'Usuário registrado com sucesso!' });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Retorna os dados do usuário autenticado
 *     responses:
 *       200:
 *         description: Sucesso
 */
authRouter.get('/me', (req, res) => {
    res.json({ user: 'Usuário Logado' });
});

export default authRouter;
