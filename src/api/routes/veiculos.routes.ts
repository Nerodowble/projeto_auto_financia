import { Router } from 'express';
import { prisma } from '../../database/prisma';

const veiculosRouter = Router();

/**
 * @swagger
 * /api/veiculos:
 *   get:
 *     summary: Lista todos os veículos
 *     responses:
 *       200:
 *         description: Sucesso
 */
veiculosRouter.get('/', async (req, res) => {
    const { lojaId } = req.query;
    const veiculos = await prisma.veiculo.findMany({
        where: { lojaId: lojaId as string },
    });
    res.json(veiculos);
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
veiculosRouter.get('/:id', async (req, res) => {
    const veiculo = await prisma.veiculo.findUnique({
        where: { id: req.params.id },
    });
    res.json(veiculo);
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
veiculosRouter.post('/', async (req, res) => {
    const { lojaId, ...veiculoData } = req.body;
    const veiculo = await prisma.veiculo.create({
        data: {
            ...veiculoData,
            loja: {
                connect: {
                    id: lojaId
                }
            }
        },
    });
    res.json(veiculo);
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
veiculosRouter.put('/:id', async (req, res) => {
    const veiculo = await prisma.veiculo.update({
        where: { id: req.params.id },
        data: req.body,
    });
    res.json(veiculo);
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
veiculosRouter.delete('/:id', async (req, res) => {
    await prisma.veiculo.delete({
        where: { id: req.params.id },
    });
    res.json({ message: 'Veículo removido com sucesso!' });
});

export default veiculosRouter;
