// Configuração do Prisma para o projeto FinAuto Hub.

export default {
  migrations: {
    // A propriedade 'seed' aponta para o comando que deve ser executado.
    seed: 'ts-node ./src/database/seed.ts',
  },
};