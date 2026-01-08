import { Router } from 'express';

import authRouter from './auth.routes';
import clientesRouter from './clientes.routes';
import veiculosRouter from './veiculos.routes';
import simulacoesRouter from './simulacoes.routes';

const routes = Router();

routes.get('/', (_req, res) => {
  res.json({ message: 'API FinAuto Hub está operacional!' });
});

routes.use('/auth', authRouter);
routes.use('/clientes', clientesRouter);
routes.use('/veiculos', veiculosRouter);
routes.use('/simulacoes', simulacoesRouter);

export default routes;