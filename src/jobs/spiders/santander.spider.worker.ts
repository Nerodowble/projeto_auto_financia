/**
 * @file santander.spider.worker.ts
 * @description
 *   Este é o worker do spider do Santander. Ele é responsável por processar UMA ÚNICA marca de veículo,
 *   extrair seus dados de ano/modelo e, em seguida, invocar o próximo worker se houver mais marcas na fila.
 *   Esta abordagem aumenta a robustez do processo de extração.
 */
import { chromium, Page, Browser, Locator } from 'playwright';
import fs from 'fs';
import { exec } from 'child_process';

// --- CONSTANTES E INTERFACES ---
const URL_PORTAL = 'https://www.cliente.santanderfinanciamentos.com.br/originacaocliente/?int_source=portalSF&int_medium=c2c&int_campaign=simular-agora#/dados-pessoais';
const MARCAS_PENDENTES_FILE = 'marcas_pendentes.json';
const RESULTADO_FINAL_FILE = 'santander_marca_ano.json';

const DADOS_FIXOS = {
  dataNascimento: '21/03/1997',
  cpf: '401.467.208-57',
  email: 'fulano.teste@email.com',
  celular: '11999998888',
};

interface Resultado {
  marca: string;
  ano_modelo: string[];
}

// --- FUNÇÕES AUXILIARES ---
// (As mesmas funções auxiliares do spider principal: extractAllOptionsFromOpenNgselect, etc.)
async function extractAllOptionsFromOpenNgselect(page: Page, panelLocator: Locator, maxScrolls = 250): Promise<string[]> {
  const items = panelLocator.locator('css=.ng-dropdown-panel-items');
  await items.waitFor({ state: 'visible', timeout: 20000 });
  const seen = new Set<string>();
  let stableRounds = 0;
  for (let i = 0; i < maxScrolls; i++) {
    const optionLocs = panelLocator.locator('xpath=.//div[@role="option"]');
    const texts = await optionLocs.allTextContents();
    let newAny = false;
    for (const t of texts) {
      const trimmedText = (t || '').trim();
      if (trimmedText && !seen.has(trimmedText)) {
        seen.add(trimmedText);
        newAny = true;
      }
    }
    if (!newAny) stableRounds++; else stableRounds = 0;
    if (stableRounds >= 4) break;
    try {
      await items.evaluate('(el) => { el.scrollTop = el.scrollTop + el.clientHeight; }');
    } catch (e) {
      await panelLocator.hover();
      await page.mouse.wheel(0, 900);
    }
    await page.waitForTimeout(140);
  }
  return Array.from(seen).sort();
}


/**
 * Função principal do worker.
 */
const processarMarcaUnica = async () => {
  // 1. LER A FILA DE MARCAS
  if (!fs.existsSync(MARCAS_PENDENTES_FILE)) {
    console.log('Fila de marcas pendentes não encontrada. Encerrando.');
    return;
  }
  const marcasPendentes: string[] = JSON.parse(fs.readFileSync(MARCAS_PENDENTES_FILE, 'utf-8'));
  if (marcasPendentes.length === 0) {
    console.log('Todas as marcas foram processadas. Encerrando.');
    fs.unlinkSync(MARCAS_PENDENTES_FILE); // Limpa o arquivo de fila
    return;
  }

  const marcaAtual = marcasPendentes.shift()!; // Pega a primeira e a remove da lista
  console.log(`\n--- Processando marca: ${marcaAtual} [${marcasPendentes.length} restantes] ---`);

  // Salva o estado da fila
  fs.writeFileSync(MARCAS_PENDENTES_FILE, JSON.stringify(marcasPendentes, null, 2));
  
  let browser: Browser | null = null;
  try {
    // 2. INICIAR NAVEGADOR E IR PARA A PÁGINA
    browser = await chromium.launch({ headless: false, slowMo: 40 });
    const page = await browser.newPage();
    page.setDefaultTimeout(35000);

    await page.goto(URL_PORTAL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(800);
    
    // 3. PREENCHER FORMULÁRIO (o mesmo fluxo até a seleção de marca)
    await page.locator('xpath=//button[contains(@class,"btn-person") and contains(normalize-space(.),"Pessoa Física")]').click();
    await page.locator('xpath=//*[@id="dateOfBirthsBlock"]/input').fill(DADOS_FIXOS.dataNascimento);
    await page.locator('xpath=//*[@id="cpfsBlock"]/input').fill(DADOS_FIXOS.cpf);
    await page.locator('xpath=//*[@id="personalEmailsBlock"]/input').fill(DADOS_FIXOS.email);
    await page.locator('xpath=//*[@id="cellphonesBlock"]/input').fill(DADOS_FIXOS.celular);
    await page.waitForTimeout(400);
    await page.locator('xpath=/html/body/app-root/div/main/app-flow-c2c/div/app-person-type-c2c/div[2]/div/app-person-type-c2c-pf/form/div/div[6]/div/label[1]').click();
    await page.locator('xpath=/html/body/app-root/div/main/app-flow-c2c/div/app-person-type-c2c/div[2]/div/app-person-type-c2c-pf/form/div/div[8]/div/button').click();
    await page.waitForTimeout(3000);
    await page.locator('xpath=/html/body/app-root/div/main/app-flow-c2c/div/app-select-vehicle-type-c2c/div/div/app-vehicle-type-c2c-btn/div/div/div[1]/button').click();
    await page.waitForTimeout(800);
    if (await page.locator('xpath=//app-financing-type-c2c').isVisible()) {
      await page.locator('xpath=(//app-financing-type-c2c//button)[2]').click();
    }
    await page.locator('xpath=//*[@id="brandsBlock"]').waitFor({ state: 'visible', timeout: 30000 });

    // 4. SELECIONAR A MARCA ATUAL E EXTRAIR DADOS
    const marcaClickArea = page.locator('xpath=//*[@id="brandsBlock"]/ng-select/div/div/div[2]');
    await marcaClickArea.click();
    await page.waitForTimeout(500);
    
    const marcaInput = page.locator('xpath=//*[@id="brandsBlock"]/ng-select/div/div/div[2]/input');
    await marcaInput.fill(marcaAtual);
    await page.waitForTimeout(350);
    await page.locator(`xpath=//span[normalize-space()="${marcaAtual}"]`).first().click();
    await page.waitForTimeout(900);

    const anoClickArea = page.locator('xpath=//*[@id="yearFuelsBlock"]/ng-select/div/div/div[2]');
    await anoClickArea.click();
    await page.waitForTimeout(500);

    const anoPanel = page.locator("css=ng-dropdown-panel").last();
    const anos = await extractAllOptionsFromOpenNgselect(page, anoPanel);
    console.log(`   Ano/Modelo encontrados para ${marcaAtual}: ${anos.length}`);

    // 5. SALVAR RESULTADO
    const resultadoItem: Resultado = { "marca": marcaAtual, "ano_modelo": anos };
    let resultadosFinais: Resultado[] = [];
    if (fs.existsSync(RESULTADO_FINAL_FILE)) {
      resultadosFinais = JSON.parse(fs.readFileSync(RESULTADO_FINAL_FILE, 'utf-8'));
    }
    resultadosFinais.push(resultadoItem);
    fs.writeFileSync(RESULTADO_FINAL_FILE, JSON.stringify(resultadosFinais, null, 2), { encoding: 'utf-8' });
    console.log(`✔ Dados de ${marcaAtual} salvos em ${RESULTADO_FINAL_FILE}`);

  } catch (error) {
    console.error(`Erro ao processar a marca "${marcaAtual}":`, error);
    // Adiciona a marca de volta na fila para tentar novamente depois, se desejado.
    // marcasPendentes.push(marcaAtual);
    // fs.writeFileSync(MARCAS_PENDENTES_FILE, JSON.stringify(marcasPendentes, null, 2));
  } finally {
    if (browser) await browser.close();
  }

  // 6. CHAMAR O PRÓXIMO WORKER
  if (marcasPendentes.length > 0) {
    console.log('Chamando próximo worker...');
    exec('npx ts-node src/jobs/spiders/santander.spider.worker.ts', (err, stdout, stderr) => {
      if (err) console.error("Erro ao chamar próximo worker:", stderr);
      console.log(stdout);
    });
  } else {
    console.log("Fila de marcas concluída.");
    if (fs.existsSync(MARCAS_PENDENTES_FILE)) fs.unlinkSync(MARCAS_PENDENTES_FILE);
  }
};

processarMarcaUnica();