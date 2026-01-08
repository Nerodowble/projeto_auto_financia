import { Router } from 'express';
import { prisma } from '../../database/prisma';

const clientesRouter = Router();

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Lista todos os clientes
 *     responses:
 *       200:
 *         description: Sucesso
 */
clientesRouter.get('/', async (req, res) => {
    const { lojaId } = req.query;
    const clientes = await prisma.cliente.findMany({
        where: { lojaId: lojaId as string },
    });
    res.json(clientes);
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
clientesRouter.get('/:id', async (req, res) => {
    const cliente = await prisma.cliente.findUnique({
        where: { id: req.params.id },
    });
    res.json(cliente);
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
clientesRouter.post('/', async (req, res) => {
    const { lojaId, dataNascimento, ...clienteData } = req.body;
    const cliente = await prisma.cliente.create({
        data: {
            ...clienteData,
            dataNascimento: new Date(dataNascimento),
            loja: {
                connect: {
                    id: lojaId
                }
            }
        },
    });
    res.json(cliente);
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
clientesRouter.put('/:id', async (req, res) => {
    const { dataNascimento, ...clienteData } = req.body;
    const cliente = await prisma.cliente.update({
        where: { id: req.params.id },
        data: {
            ...clienteData,
            dataNascimento: new Date(dataNascimento),
        },
    });
    res.json(cliente);
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
clientesRouter.delete('/:id', async (req, res) => {
    await prisma.cliente.delete({
        where: { id: req.params.id },
    });
    res.json({ message: 'Cliente removido com sucesso!' });
});

export default clientesRouter;
