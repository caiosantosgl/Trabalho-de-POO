// cep.js — Lógica de busca de CEP usando POO
// Consome a API gratuita: https://viacep.com.br

/**
 * CLASSE BuscaCEP
 * 
 * Responsável por toda a lógica de consultar
 * o serviço ViaCEP e gerenciar o histórico
 * de buscas feitas pelo usuário.
 */
class BuscaCEP {

  constructor() {
    // Atributo: lista com os CEPs que já foram buscados
    this.historico = [];
  }

  /**
   * Método principal: busca o endereço pelo CEP
   * É um método "async" porque precisa esperar a resposta da API
   * @param {string} cep - o CEP a buscar (só números)
   * @returns {object} os dados do endereço ou lança um erro
   */
  async buscar(cep) {
    // Monta a URL da API com o CEP
    const url = `https://viacep.com.br/ws/${cep}/json/`;

    // fetch() faz a requisição HTTP para a API
    const resposta = await fetch(url);

    // Verifica se a requisição teve sucesso (status 200)
    if (!resposta.ok) {
      throw new Error('Erro ao se comunicar com a API.');
    }

    // Converte a resposta para um objeto JavaScript (JSON)
    const dados = await resposta.json();

    // A API retorna { erro: true } quando o CEP não existe
    if (dados.erro) {
      throw new Error('CEP não encontrado.');
    }

    // Salva o CEP no histórico
    this._adicionarHistorico(cep, dados.localidade, dados.uf);

    return dados;
  }

  /**
   * Remove tudo que não é número do CEP
   * @param {string} cep - CEP com ou sem formatação
   * @returns {string} apenas os dígitos
   */
  limparCEP(cep) {
    return cep.replace(/\D/g, '');
  }

  /**
   * Verifica se o CEP tem 8 dígitos (obrigatório)
   */
  validar(cep) {
    return cep.length === 8;
  }

  /**
   * Método privado: adiciona uma busca ao histórico
   */
  _adicionarHistorico(cep, cidade, estado) {
    // Evita duplicatas: remove se já existir
    this.historico = this.historico.filter(h => h.cep !== cep);

    // Adiciona no início da lista (mais recente primeiro)
    this.historico.unshift({ cep, cidade, estado });

    // Limita o histórico a 5 entradas
    if (this.historico.length > 5) {
      this.historico.pop();
    }
  }
}

// =============================================
// Cria uma instância da classe BuscaCEP
// =============================================
const buscadorCEP = new BuscaCEP();

/**
 * Formata o CEP enquanto o usuário digita (xxxxx-xxx)
 */
function formatarCEP(input) {
  let valor = input.value.replace(/\D/g, ''); // só números
  if (valor.length > 5) {
    valor = valor.slice(0, 5) + '-' + valor.slice(5, 8);
  }
  input.value = valor;
}

/**
 * Função principal: chamada quando o botão "Buscar" é clicado
 */
async function buscarCEP() {
  const inputEl    = document.getElementById('input-cep');
  const btnEl      = document.getElementById('btn-cep');
  const resultadoEl = document.getElementById('resultado-cep');

  // Pega só os números do CEP digitado
  const cepLimpo = buscadorCEP.limparCEP(inputEl.value);

  // Valida se tem 8 dígitos
  if (!buscadorCEP.validar(cepLimpo)) {
    mostrarMensagem('msg-cep', 'Digite um CEP válido com 8 dígitos.', 'erro');
    return;
  }

  // Muda o estado do botão enquanto busca
  btnEl.textContent = 'Buscando...';
  btnEl.disabled    = true;
  resultadoEl.classList.add('hidden');

  // Limpa mensagens anteriores
  const msgEl = document.getElementById('msg-cep');
  msgEl.className = 'mensagem';

  try {
    // Chama o método buscar() da classe BuscaCEP
    const dados = await buscadorCEP.buscar(cepLimpo);

    // Preenche os campos com os dados retornados pela API
    document.getElementById('res-cep').textContent        = dados.cep        || '—';
    document.getElementById('res-logradouro').textContent = dados.logradouro || '—';
    document.getElementById('res-bairro').textContent     = dados.bairro     || '—';
    document.getElementById('res-cidade').textContent     = dados.localidade || '—';
    document.getElementById('res-estado').textContent     = dados.uf         || '—';
    document.getElementById('res-ibge').textContent       = dados.ibge       || '—';
    document.getElementById('res-ddd').textContent        = dados.ddd        || '—';

    // Exibe o card de resultado
    resultadoEl.classList.remove('hidden');
    resultadoEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Atualiza o histórico na tela
    atualizarHistorico();

  } catch (erro) {
    mostrarMensagem('msg-cep', erro.message, 'erro');
  }

  // Restaura o botão
  btnEl.textContent = 'Buscar';
  btnEl.disabled    = false;
}

/**
 * Atualiza a lista de histórico exibida na tela
 */
function atualizarHistorico() {
  const sectionEl = document.getElementById('historico-section');
  const listaEl   = document.getElementById('historico-lista');

  if (buscadorCEP.historico.length === 0) {
    sectionEl.style.display = 'none';
    return;
  }

  sectionEl.style.display = 'block';
  listaEl.innerHTML = '';

  // Para cada item do histórico, cria um botão clicável
  buscadorCEP.historico.forEach(item => {
    const btn = document.createElement('button');
    btn.className   = 'historico-item';
    btn.innerHTML   = `<strong>${item.cep}</strong> — ${item.cidade}/${item.estado}`;
    btn.onclick     = () => {
      document.getElementById('input-cep').value = item.cep;
      buscarCEP();
    };
    listaEl.appendChild(btn);
  });
}
