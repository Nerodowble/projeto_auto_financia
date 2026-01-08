import { Router } from 'express';
import { prisma } from '../../database/prisma';

const simulacoesRouter = Router();

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
simulacoesRouter.post('/', async (req, res) => {
    const { clienteId, veiculoId, valorEntrada, lojaId, usuarioId } = req.body;

    console.log('Dados recebidos para simulação:', req.body);

    if (!usuarioId) {
        return res.status(400).json({ message: 'Usuário não autenticado.' });
    }

    try {
        const simulacao = await prisma.simulacao.create({
            data: {
                cliente: { connect: { id: clienteId } },
                veiculo: { connect: { id: veiculoId } },
                usuario: { connect: { id: usuarioId } },
                loja: { connect: { id: lojaId } },
                valorEntrada,
                percentualEntrada: 0,
                prazoDesejado: 0,
            },
        });

        // Mock results
        const resultados = [
            {
                id: 'banco-alfa',
                nome: 'Banco Alfa',
                status: 'aprovado',
                taxaMes: 1.89,
                taxaAno: 25.2,
                valorAprovado: 85000,
                entradaMinima: 10000,
                prazoMax: 60,
                valorParcela: 1890.55,
            },
            {
                id: 'banco-beta',
                nome: 'Banco Beta',
                status: 'reprovado',
            },
        ];

        res.json(resultados);
    } catch (error) {
        console.error('Erro ao criar simulação:', error);
        res.status(500).json({ message: 'Erro interno ao processar a simulação.' });
    }
});

export default simulacoesRouter;
