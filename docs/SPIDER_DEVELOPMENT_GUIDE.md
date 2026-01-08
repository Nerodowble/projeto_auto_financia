# Guia Extensivo de Desenvolvimento de Spiders com Playwright

## 1. Introdução

Este guia é o manual completo para o desenvolvimento, teste e manutenção das spiders de automação do FinAuto Hub. O objetivo é padronizar o processo e fornecer um recurso claro para desenvolvedores, especialmente para aqueles que são novos no ecossistema de automação com Node.js e Playwright.

**Tecnologia Principal:** [Playwright](https://playwright.dev/) com TypeScript.

---

## 2. O Processo de Desenvolvimento (Passo a Passo)

### Passo 1: Criar o Arquivo do Novo Worker

1.  Navegue até a pasta `src/jobs/workers/`.
2.  Faça uma cópia do arquivo `worker.template.ts`.
3.  Renomeie a cópia para `nomeDaInstituicao.worker.ts` (ex: `bancoBeta.worker.ts`). **Use camelCase para o nome do arquivo.**

### Passo 2: Configurar as Variáveis Iniciais

Abra o novo arquivo e modifique as variáveis de configuração no topo:

```typescript
const ID_INSTITUICAO = 'banco-beta'; // ID único, em minúsculas, sem espaços
const NOME_INSTITUICAO = 'Banco Beta'; // Nome oficial para exibição
const URL_PORTAL = 'https://portal.bancobeta.com/simulacao/veiculos'; // URL exata da página de simulação
```

### Passo 3: Estudo do Portal Alvo (A Etapa Mais Importante)

Antes de escrever qualquer código de automação, você precisa agir como um detetive.

1.  **Abra o portal no seu navegador.** Use o Chrome ou Firefox.
2.  **Abra as Ferramentas de Desenvolvedor.** Pressione `F12` (ou `Ctrl+Shift+I` / `Cmd+Option+I`).
3.  **Realize o processo manualmente.** Preencha o formulário de simulação como se fosse um usuário normal. Observe cada campo, cada clique, cada tela que carrega.
4.  **Inspecione os Elementos.** Com as ferramentas de desenvolvedor abertas, use a ferramenta de seleção (geralmente um ícone de um quadrado com um cursor) para clicar nos campos do formulário (inputs, selects) e nos botões.

### Passo 4: Encontrando Seletores

Para o Playwright interagir com um elemento (clicar, preencher, etc.), ele precisa de um "endereço" para encontrá-lo na página. Esse endereço é o **seletor**.

Ao inspecionar um elemento, procure por atributos únicos na aba "Elements":

-   **`id`**: É o melhor seletor. É único na página. Ex: `id="cpf-cliente"`. O seletor CSS é `#cpf-cliente`.
-   **`name`**: Comum em formulários. Ex: `name="valorVeiculo"`. O seletor CSS é `[name="valorVeiculo"]`.
-   **`class`**: Útil, mas pode não ser único. Ex: `class="btn btn-primary"`. O seletor CSS é `.btn.btn-primary`.
-   **XPath**: Em casos de formulários dinâmicos ou com Shadow DOM, o XPath pode ser a melhor alternativa. Você pode obter o XPath de um elemento clicando com o botão direito sobre ele na aba "Elements" e selecionando "Copy > Copy XPath".

**Dica de Ouro:** Use seletores que sejam o mais específicos e o menos prováveis de mudar possível. Evite usar seletores baseados em texto ou em classes muito genéricas (`.form-control`).

### Passo 5: Implementar a Lógica de Automação no Worker

Agora, traduza as ações manuais para código Playwright dentro do bloco `try` do seu worker.

**API Essencial do Playwright (`page`):**

-   **`page.goto(URL)`**: Navega para uma página.
-   **`page.locator(seletor).fill(valor)`**: Preenche um campo de texto (`input`).
-   **`page.locator(seletor).click()`**: Clica em um elemento (botão, link, etc.).
-   **`page.locator(seletor).selectOption(valor)`**: Seleciona uma opção em um `<select>`.
-   **`page.waitForSelector(seletor, { state: 'visible', timeout: 10000 })`**: Espera um elemento aparecer na tela por até 10 segundos. **Fundamental para lidar com páginas dinâmicas.**
-   **`page.locator(seletor).textContent()`**: Extrai o texto de um elemento.
-   **`page.screenshot({ path: 'nome-do-arquivo.png' })`**: Tira uma foto da tela, excelente para depuração.

**Exemplo Prático de Implementação:**

```typescript
// ... dentro da função simularInstituicao

await page.goto(URL_PORTAL);

// Preencher CPF e Renda
await page.locator('xpath=//*[@id="customer-cpf"]').fill(cliente.cpf);
await page.locator('xpath=//input[@name="monthlyIncome"]').fill(String(cliente.rendaMensal));

// Selecionar o prazo
await page.locator('xpath=//*[@id="prazo-financiamento"]').selectOption({ value: String(veiculo.prazoDesejado) });

// Clicar em Simular e esperar o resultado
await page.locator('xpath=//*[@id="btn-submit-simulation"]').click();
await page.waitForSelector('.simulation-result', { timeout: 20000 }); // Espera mais tempo pelo resultado

// Extrair os dados
const taxaJurosText = await page.locator('xpath=//*[@class="juros-mes"]').textContent();
const valorParcelaText = await page.locator('xpath=//*[@id="valor-final-parcela"]').textContent();

// Converter e montar o objeto de resultado
const resultado: ResultadoSimulado = {
    //...
    taxaMes: parseFloat(taxaJurosText.replace('%', '')),
    valorParcela: parseFloat(valorParcelaText.replace('R$', '').trim()),
    //...
}
return resultado;
```

### Passo 6: Testando um Worker de Forma Isolada

1.  Abra o arquivo `src/jobs/test-santander.ts`.
2.  Importe a sua nova função de simulação (ex: `simularSantander`).
3.  Atualize os dados mocados (`clienteTeste`, `veiculoTeste`) se necessário.
4.  Chame a sua nova função dentro do `async` block.
5.  Execute o teste no terminal:
    ```bash
    npx ts-node src/jobs/test-santander.ts
    ```
6.  Observe o console. Se houver erros, use as mensagens e os screenshots para depurar.

**Dica de Debug:** Durante o desenvolvimento do worker, altere `headless: true` para `headless: false` em `chromium.launch()`. Isso fará com que o navegador abra na sua tela, e você poderá assistir à automação em tempo real, o que facilita enormemente a identificação de problemas.

---

## 3. Melhores Práticas e Dicas Avançadas

-   **Seja Respeitoso:** Não faça um número excessivo de requisições em um curto período. Use pausas (`await page.waitForTimeout(500)`) se necessário.
-   **Lide com CAPTCHAs:** A automação de CAPTCHAs é complexa. Se um portal tiver um, ele pode exigir uma solução de terceiros (ex: 2Captcha) ou ser um candidato a ser deixado de fora da automação.
-   **Use `try...catch...finally`:** Sempre use essa estrutura para garantir que o navegador (`browser.close()`) seja fechado, mesmo que ocorra um erro, evitando processos zumbis.
-   **Logs Detalhados:** Use `console.log` para descrever cada passo da sua automação. Isso é inestimável para a depuração quando o worker rodar em produção.
-   **Screenshots em Caso de Erro:** Dentro do bloco `catch`, sempre tire um screenshot. Ele mostrará a tela exata onde a automação falhou.
