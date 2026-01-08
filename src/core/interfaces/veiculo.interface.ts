export interface Veiculo {
  id: string;
  tipo: '0km' | 'usado';
  marca: string;
  modelo: string;
  anoFabricacao: string;
  valorVeiculo: number;
  cor: string;
  placa?: string;
  km?: number;
}

export interface SimulacaoVeiculo extends Veiculo {
  valorEntrada: number;
  percentualEntrada: number;
  prazoDesejado: number;
  observacoes: string;
}