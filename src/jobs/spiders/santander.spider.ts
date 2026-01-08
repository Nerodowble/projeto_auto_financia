/**
 * @file santander.spider.ts
 * @description
 *   Este é o spider ORQUESTRADOR do Santander. Sua única responsabilidade é extrair a lista
 *   completa de marcas de veículos, salvá-la em uma fila e iniciar o primeiro worker
 *   (`santander.spider.worker.ts`) para processar a primeira marca.
 */
import { chromium, Browser, Locator, Page } from 'playwright';
import fs from 'fs';
import { exec } from 'child_process';

// --- CONSTANTES ---
const URL_PORTAL = 'https://www.cliente.santanderfinanciamentos.com.br/originacaocliente/?int_source=portalSF&int_medium=c2c&int_campaign=simular-agora#/dados-pessoais';
const MARCAS_PENDENTES_FILE = 'marcas_pendentes.json';
const RESULTADO_FINAL_FILE = 'santander_marca_ano.json';

const DADOS_FIXOS = {
  dataNascimento: '21/03/1997',
  cpf: '401.467.208-57',
  email: 'fulano.teste@email.com',
  celular: '11999998888',
};

// --- FUNÇÕES AUXILIARES ---
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
 * Função principal do orquestrador.
 */
const iniciarExtracao = async () => {
  let browser: Browser | null = null;
  console.log('--- Iniciando orquestrador do Spider Santander ---');

  if (fs.existsSync(RESULTADO_FINAL_FILE)) {
    fs.writeFileSync(RESULTADO_FINAL_FILE, '[]', 'utf-8');
    console.log('Arquivo de resultado anterior limpo.');
  }
  if (fs.existsSync(MARCAS_PENDENTES_FILE)) {
    fs.unlinkSync(MARCAS_PENDENTES_FILE);
  }


  try {
    console.log('Extraindo lista de marcas para a fila...');
    browser = await chromium.launch({ headless: false, slowMo: 40 });
    const page = await browser.newPage();
    page.setDefaultTimeout(35000);

    await page.goto(URL_PORTAL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(800);
    
    // Tentativa robusta de clicar e prosseguir
    for (let i = 0; i < 3; i++) {
        try {
            await page.locator('xpath=//button[contains(@class,"btn-person") and contains(normalize-space(.),"Pessoa Física")]').click({ timeout: 10000 });
            const dateOfBirthInput = page.locator('xpath=//*[@id="dateOfBirthsBlock"]/input');
            await dateOfBirthInput.waitFor({ state: 'visible', timeout: 15000 });
            await dateOfBirthInput.fill(DADOS_FIXOS.dataNascimento);
            break; // Se sucesso, sai do loop
        } catch (e) {
            console.log(`Tentativa ${i + 1} falhou. Recarregando a página...`);
            if (i < 2) await page.reload({ waitUntil: 'domcontentloaded' });
            else throw e; // Falha na última tentativa, propaga o erro
        }
    }
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

    const marcaClickArea = page.locator('xpath=//*[@id="brandsBlock"]/ng-select/div/div/div[2]');
    await marcaClickArea.click();
    await page.waitForTimeout(700);
    
    const marcaPanel = page.locator("css=ng-dropdown-panel").last();
    // AUMENTANDO O NÚMERO DE ROLAGENS PARA GARANTIR A CAPTURA DE TODAS AS MARCAS
    const marcas = await extractAllOptionsFromOpenNgselect(page, marcaPanel, 500); 
    
    fs.writeFileSync(MARCAS_PENDENTES_FILE, JSON.stringify(marcas, null, 2), { encoding: 'utf-8' });
    console.log(`\n✔ ${marcas.length} marcas extraídas e salvas na fila: ${MARCAS_PENDENTES_FILE}`);

  } catch (error) {
    console.error('Erro ao extrair a lista de marcas:', error);
    return;
  } finally {
    if (browser) await browser.close();
  }

  console.log('\n--- Iniciando o primeiro worker para processar a fila ---');
  const workerProcess = exec('npx ts-node src/jobs/spiders/santander.spider.worker.ts');
  
  workerProcess.stdout?.on('data', (data) => console.log(data.toString()));
  workerProcess.stderr?.on('data', (data) => console.error(data.toString()));
  
  workerProcess.on('close', (code) => {
    console.log(`\nProcesso de extração em workers concluído com código ${code}.`);
    console.log(`Verifique o arquivo: ${RESULTADO_FINAL_FILE}`);
  });
};

iniciarExtracao();
