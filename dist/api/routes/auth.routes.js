"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRouter = (0, express_1.Router)();
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autentica um usuário
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 */
authRouter.post('/login', (req, res) => {
    res.json({ message: 'Login realizado com sucesso!' });
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
exports.default = authRouter;
//# sourceMappingURL=auth.routes.js.map