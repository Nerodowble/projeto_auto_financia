/**
 * @file santander.worker.ts
 * @description
 *   Este worker (spider) realiza a simulação de financiamento de veículo no portal do Santander.
 */

import { chromium, Page, Browser } from 'playwright';
import { Cliente } from '../../core/interfaces/cliente.interface';
import { SimulacaoVeiculo } from '../../core/interfaces/veiculo.interface';
import { ResultadoSimulacao } from '../../core/interfaces/simulacao.interface';
import fs from 'fs';

// --- VARIÁVEIS DE CONFIGURAÇÃO ---
const ID_INSTITUICAO = 'santander';
const NOME_INSTITUICAO = 'Santander';
const URL_PORTAL = 'https://www.cliente.santanderfinanciamentos.com.br/originacaocliente/?int_source=portalSF&int_medium=c2c&int_campaign=simular-agora&mathts=paid&gad_source=1&gclid=Cj0KCQiAuvTJBhCwARIsAL6DemhBrLIRZOtslKm0zwJDIob_kia31Qr-DIt5vopDOQysz03WY4lP_BkaAhA7EALw_wcB&gclsrc=aw.ds&utm_medium=search&utm_source=google#/dados-pessoais';

/**
 * Função principal do worker.
 * Orquestra a automação para o Santander Financiamentos.
 */
export const simularSantander = async (
  cliente: Cliente,
  veiculo: SimulacaoVeiculo
): Promise<ResultadoSimulacao> => {
  let browser: Browser | null = null;
  console.log(`--- Iniciando simulação no ${NOME_INSTITUICAO} ---`);

  try {
    // 1. INICIALIZAÇÃO DO NAVEGADOR
    browser = await chromium.launch({ headless: false }); // `headless: false` para visualização
    const page = await browser.newPage();
    await page.goto(URL_PORTAL);
    await page.waitForTimeout(2000);

    // 2. PREENCHIMENTO DO FORMULÁRIO
    console.log('Preenchendo dados pessoais...');
    
    // Clique em "Pessoa Física"
    await page.locator('xpath=//*[contains(concat( " ", @class, " " ), concat( " ", "btn-person", " " ))]').click();
    await page.waitForTimeout(1000);

    // Preencher campos do formulário
    await page.locator('xpath=//*[@id="dateOfBirthsBlock"]/input').fill(cliente.dataNascimento);
    await page.waitForTimeout(1000);
    await page.locator('xpath=//*[@id="cpfsBlock"]/input').fill(cliente.cpf);
    await page.waitForTimeout(1000);
    await page.locator('xpath=//*[@id="personalEmailsBlock"]/input').fill(cliente.email);
    await page.waitForTimeout(1000);
    await page.locator('xpath=//*[@id="cellphonesBlock"]/input').fill(cliente.celular);
    await page.waitForTimeout(1000);

    // Selecionar "Sim" para CNH (ajuste se necessário)
    await page.locator('xpath=/html/body/app-root/div/main/app-flow-c2c/div/app-person-type-c2c/div[2]/div/app-person-type-c2c-pf/form/div/div[6]/div/label[1]').click();
    await page.waitForTimeout(1000);

    // Clicar em "Quero simular"
    await page.locator('xpath=/html/body/app-root/div/main/app-flow-c2c/div/app-person-type-c2c/div[2]/div/app-person-type-c2c-pf/form/div/div[8]/div/button').click();
    
    console.log('Aguardando próxima página...');
    await page.waitForTimeout(3000); // Esperar 3 segundos conforme instruído

    // Selecionar "Carro"
    await page.locator('xpath=/html/body/app-root/div/main/app-flow-c2c/div/app-select-vehicle-type-c2c/div/div/app-vehicle-type-c2c-btn/div/div/div[1]/button').click();
    await page.waitForTimeout(1000);

    // Selecionar "Comprar em uma Loja ou Concessionária"
    await page.locator('xpath=/html/body/app-root/div/main/app-flow-c2c/div/app-select-vehicle-type-c2c/div/div/app-financing-type-c2c/div/div[2]/button[2]').click();
    await page.waitForTimeout(1000);

    console.log('Preenchendo dados do veículo...');
    
    // Preencher formulário do veículo com dados fictícios
    await page.locator('xpath=//*[@id="brandsBlock"]/ng-select/div/div/div[2]/input').fill('FIAT');
    await page.waitForTimeout(1000);
    await page.locator('xpath=//span[text()="FIAT"]').click();
    await page.waitForTimeout(1000);

    await page.locator('xpath=//*[@id="yearFuelsBlock"]/ng-select/div/div/div[2]/input').fill('2023 FLEX');
    await page.waitForTimeout(1000);
    await page.locator('xpath=//span[contains(text(), "2023 FLEX")]').first().click();
    await page.waitForTimeout(1000);

    await page.locator('xpath=//*[@id="modelsBlock"]/ng-select/div/div/div[2]/input').fill('DUCATO CARGO 2.2 DIESEL (E6)');
    await page.waitForTimeout(1000);
    await page.locator('xpath=//span[contains(text(), "DUCATO CARGO 2.2 DIESEL (E6)")]').first().click();
    await page.waitForTimeout(1000);

    await page.locator('xpath=//*[@id="ufsBlock"]/ng-select/div/div/div[2]/input').fill('SP');
    await page.waitForTimeout(1000);
    await page.locator('xpath=//span[contains(text(), "SP")]').click();
    await page.waitForTimeout(1000);
    await page.locator('xpath=//*[@id="placeholder"]').fill('70000');
    await page.waitForTimeout(1000);
    
    // Selecionar busca por CNPJ e preencher
    await page.locator('xpath=/html/body/app-root/div/main/app-simulation/app-vehicle-form/div/div/div/div/div[2]/form/div/div[6]/div[2]/label[3]').click();
    await page.waitForTimeout(1000);
    await page.locator('xpath=//*[@id="autoComplete"]').fill('12345678000199'); // CNPJ Fictício
    await page.waitForTimeout(1000);

    // Clicar em "Continuar"
    await page.locator('xpath=/html/body/app-root/div/main/app-simulation/app-vehicle-form/div/div/div/div/div[2]/form/div/div[7]/div[1]/button').click();

    console.log('Aguardando resultado da simulação (pode levar alguns minutos)...');
    
    // 3. CAPTURA DE TELA
    await page.waitForTimeout(15000); // Espera adicional para garantir o carregamento
    const screenshotPath = `santander_simulacao_${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot salvo em: ${screenshotPath}`);

    // 4. MONTAGEM DO RESULTADO (SUCESSO - MOCK)
    // A extração real dos dados dependeria da estrutura da página de resultados.
    const resultado: ResultadoSimulacao = {
      id: ID_INSTITUICAO,
      nome: NOME_INSTITUICAO,
      status: 'em_analise', // O resultado final não é extraído, então marcamos como "em análise"
      screenshotUrl: screenshotPath,
      observacoes: 'Simulação enviada. A tela de resultados foi capturada.',
    };

    return resultado;

  } catch (error) {
    console.error(`Erro durante a simulação no ${NOME_INSTITUICAO}:`, error);
    return {
      id: ID_INSTITUICAO,
      nome: NOME_INSTITUICAO,
      status: 'erro',
      observacoes: 'Ocorreu um erro na automação. Verifique os logs do worker.',
    };
  } finally {
    if (browser) {
      await browser.close();
    }
    console.log(`--- Simulação no ${NOME_INSTITUICAO} finalizada ---`);
  }
};
