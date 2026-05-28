// cep.js
// Busca de endereço pelo CEP usando a API ViaCEP.

/**
 * Classe BuscaCEP
 *
 * Organiza a busca na API ViaCEP e guarda o histórico das pesquisas.
 */
class BuscaCEP {

	constructor() {
		// Lista onde guardo os últimos CEPs pesquisados.
		this.historico = [];
	}

	/**
	 * Busca o endereço do CEP informado.
	 * É async porque precisa esperar a resposta da API.
	 */
	async buscar(cep) {
		// Monta o link da API usando o CEP digitado.
		const url = `https://viacep.com.br/ws/${cep}/json/`;

		// O fetch faz a requisição para a API.
		const resposta = await fetch(url);

		// Se a resposta não for boa, mostro um erro.
		if (!resposta.ok) {
			throw new Error('Erro ao se comunicar com a API.');
		}

		// Transforma a resposta JSON em objeto JavaScript.
		const dados = await resposta.json();

		// Quando o CEP não existe, a própria API retorna erro.
		if (dados.erro) {
			throw new Error('CEP não encontrado.');
		}

		// Guarda essa busca no histórico.
		this._adicionarHistorico(cep, dados.localidade, dados.uf);

		return dados;
	}

	/**
	 * Remove tudo que não for número do CEP.
	 */
	limparCEP(cep) {
		return cep.replace(/\D/g, '');
	}

	/**
	 * Verifica se o CEP tem exatamente 8 números.
	 */
	validar(cep) {
		return cep.length === 8;
	}

	/**
	 * Adiciona uma busca no histórico.
	 */
	_adicionarHistorico(cep, cidade, estado) {
		// Se o CEP já estiver no histórico, remove para não duplicar.
		this.historico = this.historico.filter(h => h.cep !== cep);

		// Coloca a busca mais recente no começo da lista.
		this.historico.unshift({ cep, cidade, estado });

		// Mantém só as 5 últimas buscas.
		if (this.historico.length > 5) {
			this.historico.pop();
		}
	}
}

// Cria o objeto que vai controlar as buscas de CEP.
const buscadorCEP = new BuscaCEP();

/**
 * Formata o CEP enquanto o usuário digita.
 */
function formatarCEP(input) {
	let valor = input.value.replace(/\D/g, ''); // deixa apenas números
	if (valor.length > 5) {
		valor = valor.slice(0, 5) + '-' + valor.slice(5, 8);
	}
	input.value = valor;
}

/**
 * Função principal da busca de CEP.
 */
async function buscarCEP() {
	const inputEl    = document.getElementById('input-cep');
	const btnEl      = document.getElementById('btn-cep');
	const resultadoEl = document.getElementById('resultado-cep');

	// Limpa o CEP antes de validar e buscar.
	const cepLimpo = buscadorCEP.limparCEP(inputEl.value);

	// CEP precisa ter 8 números.
	if (!buscadorCEP.validar(cepLimpo)) {
		mostrarMensagem('msg-cep', 'Digite um CEP válido com 8 dígitos.', 'erro');
		return;
	}

	// Muda o botão enquanto a busca está acontecendo.
	btnEl.textContent = 'Buscando...';
	btnEl.disabled    = true;
	resultadoEl.classList.add('hidden');

	// Remove mensagens antigas antes da nova busca.
	const msgEl = document.getElementById('msg-cep');
	msgEl.className = 'mensagem';

	try {
		// Chama o método da classe que faz a busca na API.
		const dados = await buscadorCEP.buscar(cepLimpo);

		// Joga os dados recebidos nos elementos da página.
		document.getElementById('res-cep').textContent        = dados.cep        || '—';
		document.getElementById('res-logradouro').textContent = dados.logradouro || '—';
		document.getElementById('res-bairro').textContent     = dados.bairro     || '—';
		document.getElementById('res-cidade').textContent     = dados.localidade || '—';
		document.getElementById('res-estado').textContent     = dados.uf         || '—';
		document.getElementById('res-ibge').textContent       = dados.ibge       || '—';
		document.getElementById('res-ddd').textContent        = dados.ddd        || '—';

		// Mostra o resultado na tela.
		resultadoEl.classList.remove('hidden');
		resultadoEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

		// Atualiza o histórico depois da busca.
		atualizarHistorico();

	} catch (erro) {
		mostrarMensagem('msg-cep', erro.message, 'erro');
	}

	// Volta o botão para o estado normal.
	btnEl.textContent = 'Buscar';
	btnEl.disabled    = false;
}

/**
 * Atualiza o histórico que aparece embaixo da busca.
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

	// Cada item do histórico vira um botão para pesquisar de novo.
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
