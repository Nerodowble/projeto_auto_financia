"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientesRouter = (0, express_1.Router)();
/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Lista todos os clientes
 *     responses:
 *       200:
 *         description: Sucesso
 */
clientesRouter.get('/', (req, res) => {
    res.json({ message: 'Listando todos os clientes' });
});
/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Busca um cliente por ID
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
clientesRouter.get('/:id', (req, res) => {
    res.json({ message: `Buscando cliente com ID: ${req.params.id}` });
});
/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Cria um novo cliente
 *     responses:
 *       200:
 *         description: Sucesso
 */
clientesRouter.post('/', (req, res) => {
    res.json({ message: 'Cliente criado com sucesso!' });
});
/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Atualiza um cliente existente
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
clientesRouter.put('/:id', (req, res) => {
    res.json({ message: `Cliente com ID: ${req.params.id} atualizado!` });
});
/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     summary: Remove um cliente
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
clientesRouter.delete('/:id', (req, res) => {
    res.json({ message: `Cliente com ID: ${req.params.id} removido!` });
});
exports.default = clientesRouter;
//# sourceMappingURL=clientes.routes.js.map