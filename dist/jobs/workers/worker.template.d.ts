/**
 * @file worker.template.ts
 * @description
 *   Este é um template para criar novos workers (spiders) de automação.
 *   Para criar um novo worker:
 *   1. Copie este arquivo.
 *   2. Renomeie-o para "{nomeDaInstituicao}.worker.ts" (ex: "bancoBeta.worker.ts").
 *   3. Adapte a lógica da função `simularInstituicao` para o portal da instituição específica.
 *   4. Lembre-se de atualizar os seletores CSS e a lógica de extração de dados.
 */
import { Cliente } from '../../core/interfaces/cliente.interface';
import { SimulacaoVeiculo } from '../../core/interfaces/veiculo.interface';
import { ResultadoSimulacao } from '../../core/interfaces/simulacao.interface';
/**
 * Função principal do worker.
 * Ela orquestra a automação para uma instituição financeira.
 *
 * @param cliente Os dados do cliente.
 * @param veiculo Os dados do veículo para a simulação.
 * @returns Uma promessa que resolve com o resultado da simulação.
 */
export declare const simularInstituicao: (cliente: Cliente, veiculo: SimulacaoVeiculo) => Promise<ResultadoSimulacao>;
//# sourceMappingURL=worker.template.d.ts.map