"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const simulacoesRouter = (0, express_1.Router)();
/**
 * @swagger
 * /api/simulacoes:
 *   get:
 *     summary: Retorna o histórico de simulações
 *     responses:
 *       200:
 *         description: Sucesso
 */
simulacoesRouter.get('/', (req, res) => {
    res.json({ message: 'Listando todas as simulações' });
});
/**
 * @swagger
 * /api/simulacoes/{id}:
 *   get:
 *     summary: Detalhes de uma simulação específica
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sucesso
 */
simulacoesRouter.get('/:id', (req, res) => {
    res.json({ message: `Buscando simulação com ID: ${req.params.id}` });
});
/**
 * @swagger
 * /api/simulacoes:
 *   post:
 *     summary: Dispara uma nova simulação de financiamento
 *     responses:
 *       200:
 *         description: Sucesso
 */
simulacoesRouter.post('/', (req, res) => {
    res.json({ message: 'Simulação criada com sucesso!' });
});
exports.default = simulacoesRouter;
//# sourceMappingURL=simulacoes.routes.js.map