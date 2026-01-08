"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simularBancoAlfa = void 0;
const playwright_1 = require("playwright");
// Função auxiliar para simular o preenchimento de um campo
const preencherCampo = async (page, seletor, valor) => {
    await page.fill(seletor, String(valor));
    console.log(`Preenchido ${seletor} com "${valor}"`);
};
// A spider para o Banco Alfa
const simularBancoAlfa = async (cliente, veiculo) => {
    console.log('--- Iniciando simulação no Banco Alfa ---');
    const browser = await playwright_1.chromium.launch({ headless: true }); // headless: false para ver o navegador
    const page = await browser.newPage();
    try {
        // Navegar para o Google
        await page.goto('https://www.google.com');
        console.log('Navegou para a página do Google.');
        // Digitar o modelo do veículo na barra de pesquisa
        const termoPesquisa = `${veiculo.marca} ${veiculo.modelo} ${veiculo.anoFabricacao}`;
        await page.fill('textarea[name="q"]', termoPesquisa);
        console.log(`Digitou "${termoPesquisa}" na barra de pesquisa.`);
        // Clicar no botão de pesquisa (usando 'locator' e 'first' para garantir que pegamos o botão certo)
        await page.locator('input[type="submit"]').first().click();
        console.log('Clicou no botão de pesquisa.');
        // Esperar a navegação para a página de resultados
        await page.waitForNavigation();
        console.log('Página de resultados carregada.');
        // Tirar um screenshot
        const screenshotPath = `google_search_${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath });
        console.log(`Screenshot salvo em: ${screenshotPath}`);
        // Extrair o título da página de resultados
        const pageTitle = await page.title();
        // Simulação de um resultado bem-sucedido
        const resultado = {
            id: 'banco-alfa',
            nome: 'Banco Alfa (Teste Google)',
            status: 'aprovado',
            taxaMes: 1.99,
            valorAprovado: veiculo.valorVeiculo - veiculo.valorEntrada,
            valorParcela: 2450, // Valor fictício
            observacoes: `Título da página de resultados: "${pageTitle}"`,
        };
        return resultado;
    }
    catch (error) {
        console.error('Erro durante a simulação no Banco Alfa:', error);
        return {
            id: 'banco-alfa',
            nome: 'Banco Alfa',
            status: 'erro',
            observacoes: 'Ocorreu um erro inesperado durante a automação.',
        };
    }
    finally {
        await browser.close();
        console.log('--- Simulação no Banco Alfa finalizada ---');
    }
};
exports.simularBancoAlfa = simularBancoAlfa;
//# sourceMappingURL=bancoAlfa.worker.js.map