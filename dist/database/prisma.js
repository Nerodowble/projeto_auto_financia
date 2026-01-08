"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Cria e exporta uma instância única do PrismaClient.
// Esta abordagem (Singleton) garante que apenas uma conexão com o banco de dados
// seja mantida em toda a aplicação, o que é uma boa prática.
exports.prisma = new client_1.PrismaClient();
//# sourceMappingURL=prisma.js.map