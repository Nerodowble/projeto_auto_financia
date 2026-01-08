import { prisma } from './prisma';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

async function main() {
  console.log('Iniciando o processo de seeding...');

  // --- Limpeza do Banco de Dados (Opcional, mas recomendado para consistência) ---
  // A ordem é importante para evitar erros de chave estrangeira
  await prisma.resultadoSimulacao.deleteMany({});
  await prisma.simulacao.deleteMany({});
  await prisma.credenciaisInstituicao.deleteMany({});
  await prisma.instituicao.deleteMany({});
  await prisma.veiculo.deleteMany({});
  await prisma.cliente.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.loja.deleteMany({});
  console.log('Banco de dados limpo.');

  // --- Criação da Loja ---
  const loja = await prisma.loja.create({
    data: {
      nome: 'Garagem do Zé',
      cnpj: '12.345.678/0001-99',
    },
  });
  console.log(`Loja criada: ${loja.nome}`);

  // --- Criação do Usuário ---
  const usuario = await prisma.usuario.create({
    data: {
      nome: 'José Vendedor',
      email: 'ze.vendedor@garagem.com',
      senhaHash: 'senha_super_segura_hash', // Em um projeto real, isso seria um hash bcrypt
      role: 'vendedor',
      lojaId: loja.id,
    },
  });
  console.log(`Usuário criado: ${usuario.nome}`);

  // --- Criação de Instituições Financeiras ---
  await prisma.instituicao.createMany({
    data: [
        { id: 'banco-alfa', nome: 'Banco Alfa' },
        { id: 'banco-beta', nome: 'Banco Beta' },
        { id: 'financeira-gamma', nome: 'Financeira Gamma' },
        { id: 'banco-delta', nome: 'Banco Delta' },
    ],
  });
  console.log('Instituições financeiras criadas.');

  // --- Criação de Clientes ---
  const cliente1 = await prisma.cliente.create({
    data: {
      nomeCompleto: 'Carlos Alberto da Silva',
      cpf: '123.456.789-00',
      email: 'carlos.silva@email.com',
      lojaId: loja.id,
    },
  });
  console.log(`Cliente criado: ${cliente1.nomeCompleto}`);
  
  // --- Criação de Veículos ---
  const veiculo1 = await prisma.veiculo.create({
      data: {
          tipo: '0km',
          marca: 'Chevrolet',
          modelo: 'Onix Plus Premier',
          anoFabricacao: '2024',
          valorVeiculo: 98500,
          lojaId: loja.id,
      }
  });
  console.log(`Veículo criado: ${veiculo1.marca} ${veiculo1.modelo}`);

  console.log('Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro durante o seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });