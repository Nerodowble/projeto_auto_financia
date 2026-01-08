# DOCUMENTAÇÃO: Spiders de Automação com Playwright

Este documento detalha o processo de criação, configuração e teste das spiders (workers) de automação para o projeto FinAuto Hub, utilizando Playwright com TypeScript/Node.js.

---

## 1. Visão Geral da Arquitetura

A automação de simulações não é executada diretamente pela API para evitar o bloqueio de requisições. Em vez disso, adotamos uma arquitetura baseada em workers e filas de jobs.

**Fluxo de Execução:**
1.  O frontend envia uma requisição para `POST /api/simulacoes`.
2.  A API cria um "job" (tarefa) para cada instituição financeira selecionada.
3.  Cada job é adicionado a uma fila de processamento (ex: Redis com BullMQ).
4.  Um **Worker** (a nossa spider) ocioso pega um job da fila para processar.
5.  O worker, usando **Playwright**, abre um navegador, acessa o portal da instituição, preenche os dados, realiza a simulação e captura os resultados.
6.  O resultado é salvo no banco de dados, e o status do job é atualizado.

---

## 2. Configuração do Ambiente

### 2.1 Instalação do Playwright

O primeiro passo é adicionar o Playwright ao projeto.

```bash
# 1. Instalar a biblioteca do Playwright
npm install playwright

# 2. Baixar os navegadores (Chromium, Firefox, WebKit)
npx playwright install
```

A segunda etapa é crucial, pois baixa os binários dos navegadores que serão controlados pela automação, garantindo total compatibilidade.

### 2.2 Estrutura de Pastas

A lógica da automação reside na pasta `src/jobs`.

-   **`src/jobs/workers/`**: Contém os arquivos de cada spider. Cada arquivo é responsável pela automação de uma instituição financeira específica (ex: `bancoAlfa.worker.ts`, `santander.worker.ts`).
-   **`src/jobs/spiders/`**: Contém os arquivos de spiders mais complexos, que podem ser usados para extrair dados em massa.
-   **`src/jobs/test-santander.ts`**: Um script auxiliar utilizado para executar e testar um worker de forma isolada, sem a necessidade de passar pela API.

---

## 3. Criação de um Worker (Spider)

Cada worker é um arquivo TypeScript que exporta uma função assíncrona.

**Exemplo de Estrutura (`santander.worker.ts`):**

```typescript
import { chromium } from 'playwright';
import { Cliente } from '../../core/interfaces/cliente.interface';
import { SimulacaoVeiculo } from '../../core/interfaces/veiculo.interface';
import { ResultadoSimulacao } from '../../core/interfaces/simulacao.interface';

// A função principal do worker
export const simularSantander = async (
  cliente: Cliente,
  veiculo: SimulacaoVeiculo
): Promise<ResultadoSimulacao> => {
  // 1. Inicialização do Navegador
  const browser = await chromium.launch({ headless: false }); // headless: false para visualização
  const page = await browser.newPage();

  try {
    // 2. Navegação e Interação
    await page.goto('URL_DO_PORTAL_DO_SANTANDER');
    await page.waitForTimeout(2000);

    // 3. Preenchimento de Formulário
    await page.locator('xpath=...').click();
    await page.locator('xpath=...').fill(cliente.cpf);
    // ... preencher outros campos ...

    // 4. Ações do Usuário
    await page.locator('xpath=...').click();

    // 5. Espera e Extração de Dados
    await page.waitForTimeout(5000);
    const screenshotPath = `santander_simulacao_${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath });

    // 6. Tratamento dos Dados e Retorno
    return {
      id: 'santander',
      nome: 'Santander',
      status: 'em_analise',
      screenshotUrl: screenshotPath,
      // ... outros dados extraídos ...
    };

  } catch (error) {
    // 7. Tratamento de Erros
    console.error('Erro na automação do Santander:', error);
    return {
      id: 'santander',
      nome: 'Santander',
      status: 'erro',
      observacoes: 'Falha ao processar a simulação.',
    };
  } finally {
    // 8. Finalização
    await browser.close();
  }
};
```

---

## 4. Testando um Worker de Forma Isolada

Para agilizar o desenvolvimento, testamos cada worker individualmente.

1.  **Criação de Dados Mocado:** No arquivo `src/jobs/test-santander.ts`, criamos objetos `Cliente` e `SimulacaoVeiculo` com dados de exemplo.

2.  **Execução do Script:** Usamos `ts-node` para executar o teste diretamente do terminal.

    ```bash
    npx ts-node src/jobs/test-santander.ts
    ```

3.  **Verificação da Saída:** O console exibirá o log de execução passo a passo da automação e, ao final, o objeto `ResultadoSimulacao` retornado pelo worker. Screenshots e outros artefatos gerados também servem como evidência do sucesso da execução.

Este processo permite desenvolver e depurar a lógica de scraping de cada portal financeiro de forma rápida e eficiente, antes de integrá-la ao sistema de filas da aplicação principal.
