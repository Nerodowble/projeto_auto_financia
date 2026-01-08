import { simularSantander } from './workers/santander.worker';
import { Cliente } from '../core/interfaces/cliente.interface';
import { SimulacaoVeiculo } from '../core/interfaces/veiculo.interface';

// --- DADOS DE TESTE ---
// Use dados fictícios para testar o worker.
const clienteTeste: Cliente = {
  id: 'test-client-123',
  nomeCompleto: 'Fulano de Tal da Silva',
  cpf: '401.467.208-57', // CPF válido para teste
  dataNascimento: '21/03/1997',
  email: 'fulano.teste@email.com',
  celular: '11999998888',
  estadoCivil: 'solteiro',
  rendaMensal: 5000,
  tipoVinculo: 'clt',
  tempoEmprego: 'mais_5_anos',
};

const veiculoTeste: SimulacaoVeiculo = {
  id: 'test-vehicle-456',
  tipo: 'usado',
  marca: 'FIAT',
  modelo: 'MOBI LIKE 1.0',
  anoFabricacao: '2023',
  valorVeiculo: 70000,
  cor: 'Branco',
  valorEntrada: 10000,
  percentualEntrada: 0,
  prazoDesejado: 48,
  observacoes: '',
};

/**
 * Função auto-executável para testar o worker do Santander.
 */
(async () => {
  console.log('--- Iniciando teste do worker Santander ---');
  const resultado = await simularSantander(clienteTeste, veiculoTeste);
  console.log('\n--- Resultado final do teste ---');
  console.log(resultado);
  console.log('---------------------------------');
})();
