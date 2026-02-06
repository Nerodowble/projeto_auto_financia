/**
 * @file santander.spider.ts
 * @description
 *   Este spider extrai a lista completa de modelos de veículos do portal Santander,
 *   baseando-se em um arquivo JSON preexistente de marcas e anos.
 */
import { chromium, Browser, Locator, Page } from 'playwright';
import fs from 'fs';

// --- CONSTANTES ---
const URL_PORTAL = 'https://www.cliente.santanderfinanciamentos.com.br/originacaocliente/?int_source=portalSF&int_medium=c2c&int_campaign=simular-agora#/dados-pessoais';
const MARCA_ANO_FILE = 'santander_marca_ano.json';
const RESULTADO_FINAL_FILE = 'santander_modelos.json';

const DADOS_FIXOS = {
  dataNascimento: '21/03/1997',
  cpf: '401.467.208-57',
  email: 'fulano.teste@email.com',
  celular: '11999998888',
};

// --- INTERFACES ---
interface MarcaAno {
    marca: string;
    ano_modelo: string[];
}

interface ModelosPorAno {
    ano_modelo: string;
    modelos: string[];
}

interface ResultadoFinal {
    marca: string;
    modelos_por_ano: ModelosPorAno[];
}

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
        if (stableRounds >= 10) break;

        await panelLocator.hover();
        await page.mouse.wheel(0, 1000);
        await page.waitForTimeout(500);
    }
    return Array.from(seen).sort();
}


/**
 * Função principal do orquestrador.
 */
const iniciarExtracao = async () => {
  let browser: Browser | null = null;
  console.log('--- Iniciando orquestrador do Spider Santander ---');

  if (!fs.existsSync(MARCA_ANO_FILE)) {
      console.error(`Erro: Arquivo de entrada ${MARCA_ANO_FILE} não encontrado.`);
      return;
  }
  const marcasAnos: MarcaAno[] = JSON.parse(fs.readFileSync(MARCA_ANO_FILE, 'utf-8'));

  if (fs.existsSync(RESULTADO_FINAL_FILE)) {
    fs.writeFileSync(RESULTADO_FINAL_FILE, '[]', 'utf-8');
    console.log('Arquivo de resultado anterior limpo.');
  }

  try {
    browser = await chromium.launch({ headless: false, slowMo: 40 });
    const page = await browser.newPage();
    page.setDefaultTimeout(45000); // Timeout um pouco maior

    // Navegação e preenchimento do formulário inicial
    await page.goto(URL_PORTAL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(800);
    
    for (let i = 0; i < 3; i++) {
        try {
            await page.locator('xpath=//button[contains(@class,"btn-person") and contains(normalize-space(.),"Pessoa Física")]').click({ timeout: 10000 });
            const dateOfBirthInput = page.locator('xpath=//*[@id="dateOfBirthsBlock"]/input');
            await dateOfBirthInput.waitFor({ state: 'visible', timeout: 15000 });
            await dateOfBirthInput.fill(DADOS_FIXOS.dataNascimento);
            break; 
        } catch (e) {
            console.log(`Tentativa ${i + 1} falhou. Recarregando a página...`);
            if (i < 2) await page.reload({ waitUntil: 'domcontentloaded' });
            else throw e;
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


    // Inicia o processamento
    for (const [index, item] of marcasAnos.entries()) {
      console.log(`\n--- [${index + 1}/${marcasAnos.length}] Processando marca: ${item.marca} ---`);
      try {
        await processarMarca(page, item);
      } catch (error) {
        console.error(`Erro fatal ao processar a marca "${item.marca}":`, error);
      }
    }

  } catch (error) {
    console.error('Erro geral no processo de extração:', error);
  } finally {
    if (browser) await browser.close();
    console.log(`\nProcesso de extração concluído.`);
    console.log(`Verifique o arquivo: ${RESULTADO_FINAL_FILE}`);
  }
};

/**
 * Processa uma única marca, iterando por seus anos para extrair os modelos.
 */
async function processarMarca(page: Page, item: MarcaAno) {
    const { marca, ano_modelo } = item;
    const brandDropdown = page.locator('xpath=//*[@id="brandsBlock"]/ng-select');
    const anoDropdown = page.locator('xpath=//*[@id="yearFuelsBlock"]/ng-select');

    // 1. Seleciona a marca
    await brandDropdown.click();
    await brandDropdown.locator('input').fill(marca);
    await page.waitForTimeout(400);
    await page.locator(`xpath=//div[@role="option" and .//span[normalize-space()="${marca}"]]`).first().click();
    await page.waitForTimeout(1000);

    const dadosMarca: ResultadoFinal = {
        marca: marca,
        modelos_por_ano: []
    };

    // 2. Itera por cada ano/modelo
    for (const ano of ano_modelo) {
        try {
            console.log(`   Processando ano: ${ano}`);
            // Seleciona o ano
            await anoDropdown.click();
            await anoDropdown.locator('input').fill(ano);
            await page.waitForTimeout(400);
            await page.locator(`xpath=//div[@role="option" and .//span[normalize-space()="${ano}"]]`).first().click();
            await page.waitForTimeout(1000);

            // Extrai os modelos
            const modeloDropdown = page.locator('xpath=//*[@id="modelsBlock"]/ng-select');
            await modeloDropdown.click();
            await page.waitForTimeout(500);
            const modeloPanel = page.locator("css=ng-dropdown-panel").last();
            const modelos = await extractAllOptionsFromOpenNgselect(page, modeloPanel, 300);
            console.log(`      -> ${modelos.length} modelos encontrados.`);
            
            dadosMarca.modelos_por_ano.push({ ano_modelo: ano, modelos: modelos });
            
            // Limpa a seleção do ano para a próxima iteração
            await page.locator('body').click({ position: { x: 5, y: 5 } }); // Clica fora para fechar
            const clearAnoButton = anoDropdown.locator('span.ng-clear-wrapper');
             if (await clearAnoButton.isVisible()) {
                await clearAnoButton.click();
                await page.waitForTimeout(500);
            }

        } catch (error) {
            console.error(`      Erro ao processar o ano "${ano}" para a marca "${marca}". Pulando para o próximo.`, error);
             await page.locator('body').click({ position: { x: 5, y: 5 } }); // Tenta fechar dropdowns abertos
        }
    }
    
    // 3. Salva o resultado consolidado da marca
    let resultadosFinais: ResultadoFinal[] = [];
    if (fs.existsSync(RESULTADO_FINAL_FILE)) {
        const fileContent = fs.readFileSync(RESULTADO_FINAL_FILE, 'utf-8');
        if(fileContent) resultadosFinais = JSON.parse(fileContent);
    }
    resultadosFinais.push(dadosMarca);
    fs.writeFileSync(RESULTADO_FINAL_FILE, JSON.stringify(resultadosFinais, null, 2), { encoding: 'utf-8' });
    console.log(`✔ Dados de ${marca} salvos em ${RESULTADO_FINAL_FILE}`);

    // 4. Limpa a seleção da marca para a próxima iteração
    const clearBrandButton = brandDropdown.locator('span.ng-clear-wrapper');
    if (await clearBrandButton.isVisible()) {
        await clearBrandButton.click();
        await page.waitForTimeout(500);
    }
}


iniciarExtracao();
