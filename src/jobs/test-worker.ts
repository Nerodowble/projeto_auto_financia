import { Cliente } from '../core/interfaces/cliente.interface';
import { SimulacaoVeiculo } from '../core/interfaces/veiculo.interface';
import { simularBancoAlfa } from './workers/bancoAlfa.worker';

// Dados mocados para o teste
const mockCliente: Cliente = {
  id: 'cli-test-001',
  nomeCompleto: 'Fulano de Tal',
  cpf: '123.456.789-00',
  dataNascimento: '1990-01-01',
  email: 'fulano@teste.com',
  celular: '(11) 99999-8888',
  estadoCivil: 'solteiro',
  rendaMensal: 5000,
  tipoVinculo: 'clt',
  tempoEmprego: '2_5_anos',
};

const mockVeiculo: SimulacaoVeiculo = {
  id: 'vei-test-001',
  tipo: 'usado',
  marca: 'Fiat',
  modelo: 'Mobi',
  anoFabricacao: '2022',
  valorVeiculo: 60000,
  cor: 'Branco',
  placa: 'BRA2E19',
  km: 30000,
  valorEntrada: 15000,
  percentualEntrada: 25,
  prazoDesejado: 48,
  observacoes: 'Teste de simulação via worker.',
};

// Função principal para executar o teste
const runTest = async () => {
  console.log('--- Iniciando teste do worker Banco Alfa ---');
  const resultado = await simularBancoAlfa(mockCliente, mockVeiculo);
  console.log('\n--- Resultado da Simulação ---');
  console.log(resultado);
  console.log('------------------------------');
};

// Executa o teste
runTest();