export interface Cliente {
    id: string;
    nomeCompleto: string;
    cpf: string;
    dataNascimento: string;
    email: string;
    celular: string;
    estadoCivil: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
    rendaMensal: number;
    tipoVinculo: 'clt' | 'autonomo' | 'empresario' | 'aposentado' | 'funcionario_publico' | 'liberal';
    tempoEmprego: 'menos_6_meses' | '6_12_meses' | '1_2_anos' | '2_5_anos' | 'mais_5_anos';
}
//# sourceMappingURL=cliente.interface.d.ts.map