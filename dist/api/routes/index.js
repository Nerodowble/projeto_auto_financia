"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const clientes_routes_1 = __importDefault(require("./clientes.routes"));
const veiculos_routes_1 = __importDefault(require("./veiculos.routes"));
const simulacoes_routes_1 = __importDefault(require("./simulacoes.routes"));
const routes = (0, express_1.Router)();
routes.get('/', (_req, res) => {
    res.json({ message: 'API FinAuto Hub está operacional!' });
});
routes.use('/auth', auth_routes_1.default);
routes.use('/clientes', clientes_routes_1.default);
routes.use('/veiculos', veiculos_routes_1.default);
routes.use('/simulacoes', simulacoes_routes_1.default);
exports.default = routes;
//# sourceMappingURL=index.js.map