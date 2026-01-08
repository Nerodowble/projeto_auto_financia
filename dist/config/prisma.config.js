"use strict";
// Configuração do Prisma para o projeto FinAuto Hub.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    migrations: {
        // A propriedade 'seed' aponta para o comando que deve ser executado.
        seed: 'ts-node ./src/database/seed.ts',
    },
};
//# sourceMappingURL=prisma.config.js.map