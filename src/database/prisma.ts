import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env para o `process.env`
dotenv.config();

// Exporta uma instância única do PrismaClient
export const prisma = new PrismaClient();
