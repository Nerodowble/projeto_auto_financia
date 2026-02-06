import { chromium, Browser, Page } from 'playwright';

/**
 * @file santander.spider.ts
 * @description Automação completa para extração de todas as combinações de 
 * parcelas e valores no portal Santander C2C.
 */
const executarSimulacaoCompleta = async () => {
  console.log('--- [INÍCIO] Iniciando Automação Santander ---');

  const browser: Browser = await chromium.launch({ 
    headless: false, 
    slowMo: 100 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1330, height: 800 }
  });

  const page: Page = await context.newPage();

  try {
    // 1. ACESSO E DADOS PESSOAIS
    console.log('=> [1/9] Abrindo portal...');
    await page.goto('https://www.cliente.santanderfinanciamentos.com.br/originacaocliente/?int_source=portalSF&int_medium=c2c&int_campaign=simular-agora#/dados-pessoais', { 
      waitUntil: 'networkidle' 
    });

    console.log('=> [2/9] Preenchendo dados pessoais...');
    await page.locator('.btn-person').click();
    await page.locator('#dateOfBirthsBlock input').fill('21/03/1997');
    await page.locator('#cpfsBlock input').fill('401.467.208-57');
    await page.locator('#personalEmailsBlock input').fill('willianvidallima@outlook.com');
    await page.locator('#cellphonesBlock input').fill('11973297563');
    await page.locator('.btn-simulate').click();

    // 2. SELEÇÃO DO VEÍCULO
    console.log('=> [3/9] Selecionando tipo "Veículo"...');
    await page.locator('.btn-vehicle').waitFor({ state: 'visible' });
    await page.locator('.btn-vehicle').click();

    console.log('=> [4/9] Preenchendo Marca e Ano/Modelo...');
    await page.locator('.vehicle-brand input').fill('FIAT');
    await page.locator('ng-dropdown-panel .ng-option').first().click();
    
    await page.locator('.vehicle-yearModel input').fill('2026 DIESEL');
    await page.locator('ng-dropdown-panel .ng-option').first().click();

    console.log('=> [5/9] Selecionando Modelo e UF...');
    await page.locator('#modelsBlock ng-select input[type=text]').click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.locator('#ufsBlock ng-select input[type=text]').fill('Sao Paulo');
    await page.keyboard.press('Enter');

    // 3. VALOR DO VEÍCULO E ENTRADA
    console.log('=> [6/9] Preenchendo Valor do Veículo...');
    const valorVeiculo = page.locator('#valor-veiculo');
    await valorVeiculo.click();
    await valorVeiculo.pressSequentially('5000000', { delay: 50 }); // R$ 50.000,00
    await page.locator('.btn-simulate').click();

    console.log('=> [7/9] Tela de resultados: Definindo Entrada...');
    const entradaInput = page.locator('input[name="valor-entrada"]');
    await entradaInput.waitFor({ state: 'visible', timeout: 30000 });
    await entradaInput.click();
    await entradaInput.fill('');
    await entradaInput.pressSequentially('4000000', { delay: 50 }); // R$ 40.000,00
    await page.keyboard.press('Tab');

    // 4. LOOP DE PARCELAS (PICKLIST)
    console.log('=> [8/9] Iniciando varredura do Picklist de Parcelas...');
    await page.waitForTimeout(2000);

    const dropdownTermos = page.locator('#terms');
    
    // Abrimos uma vez para contar as opções
    await dropdownTermos.click();
    const opcoes = page.locator('ng-dropdown-panel .ng-option');
    await opcoes.first().waitFor();
    const totalOpcoes = await opcoes.count();
    console.log(`=> Detectadas ${totalOpcoes} opções de prazos.`);
    
    // Clica fora para fechar antes de iniciar o loop organizado
    await page.mouse.click(0, 0);

    const resultados: string[] = [];

    for (let i = 0; i < totalOpcoes; i++) {
      console.log(`   -> Processando opção ${i + 1} de ${totalOpcoes}...`);
      
      // Abre o dropdown
      await dropdownTermos.click();
      
      // Pega o texto da opção antes de clicar (ex: "48")
      const opcaoTexto = await opcoes.nth(i).innerText();
      
      // Clica na opção
      await opcoes.nth(i).click();
      
      // Aguarda o recálculo (o valor da parcela muda na tela)
      await page.waitForTimeout(1500); 
      
      // Captura o valor resultante
      const valorParcela = await page.locator('#installmentValue').innerText();
      
      const linha = `${opcaoTexto.trim()}x de ${valorParcela.trim()}`;
      resultados.push(linha);
      console.log(`      Resultado: ${linha}`);
    }

    // 5. LOG FINAL
    console.log('\n=========================================');
    console.log('✔ RESUMO DA SIMULAÇÃO FINALIZADO');
    console.log('Valor da Entrada: R$ 40.000,00');
    console.log('Resultados Extraídos:');
    resultados.forEach(res => console.log(` - ${res}`));
    console.log('=========================================\n');

  } catch (error) {
    console.error('\n❌ ERRO DURANTE A EXECUÇÃO:');
    console.error(error instanceof Error ? error.message : error);
  } finally {
    console.log('=> Encerrando navegador...');
    await page.waitForTimeout(2000);
    await browser.close();
    console.log('--- [FIM] ---');
  }
};

executarSimulacaoCompleta();