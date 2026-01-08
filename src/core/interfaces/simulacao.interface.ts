export type StatusSimulacao = 'aprovado' | 'reprovado' | 'em_analise' | 'erro';

export interface DetalheParcela {
  prazo: number;
  parcela: number;
}

export interface ResultadoSimulacao {
  id: string;
  nome: string;
  status: StatusSimulacao;
  taxaMes?: number;
  taxaAno?: number;
  valorAprovado?: number;
  entradaMinima?: number;
  prazoMax?: number;
  valorParcela?: number;
  detalhesParcelas?: DetalheParcela[];
  observacoes?: string;
  screenshotUrl?: string;
}
