"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const veiculosRouter = (0, express_1.Router)();
/**
 * @swagger
 * /api/veiculos:
 *   get:
 *     summary: Lista todos os veículos
 *     responses:
 *       200:
 *         description: Sucesso
 */
veiculosRouter.get('/', (req, res) => {
    res.json({ message: 'Listando todos os veículos' });
});
/**
 * @swagger
 * /api/veiculos/{id}:
 *   get:
 *     summary: Busca um veículo por ID
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
veiculosRouter.get('/:id', (req, res) => {
    res.json({ message: `Buscando veículo com ID: ${req.params.id}` });
});
/**
 * @swagger
 * /api/veiculos:
 *   post:
 *     summary: Adiciona um novo veículo
 *     responses:
 *       200:
 *         description: Sucesso
 */
veiculosRouter.post('/', (req, res) => {
    res.json({ message: 'Veículo criado com sucesso!' });
});
/**
 * @swagger
 * /api/veiculos/{id}:
 *   put:
 *     summary: Atualiza um veículo existente
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
veiculosRouter.put('/:id', (req, res) => {
    res.json({ message: `Veículo com ID: ${req.params.id} atualizado!` });
});
/**
 * @swagger
 * /api/veiculos/{id}:
 *   delete:
 *     summary: Remove um veículo
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
veiculosRouter.delete('/:id', (req, res) => {
    res.json({ message: `Veículo com ID: ${req.params.id} removido!` });
});
exports.default = veiculosRouter;
//# sourceMappingURL=veiculos.routes.js.map