// github.js
// Busca dados de usuários usando a API pública do GitHub.

/**
 * Classe BuscaGitHub
 *
 * Organiza as buscas de perfil e repositórios no GitHub.
 */
class BuscaGitHub {

	constructor() {
		// Link principal da API do GitHub.
		this.baseURL = 'https://api.github.com';
	}

	/**
	 * Busca os dados principais de um usuário do GitHub.
	 */
	async buscarPerfil(usuario) {
		const url = `${this.baseURL}/users/${usuario}`;
		const resposta = await fetch(url);

		// 404 significa que o usuário não foi encontrado.
		if (resposta.status === 404) {
			throw new Error(`Usuário "${usuario}" não encontrado no GitHub.`);
		}

		// 403 pode acontecer quando a API limita muitas buscas seguidas.
		if (resposta.status === 403) {
			throw new Error('Limite de buscas da API atingido. Aguarde um minuto.');
		}

		if (!resposta.ok) {
			throw new Error('Erro ao acessar a API do GitHub.');
		}

		return await resposta.json();
	}

	/**
	 * Busca os repositórios públicos do usuário.
	 */
	async buscarRepositorios(usuario) {
		// Ordena pelos repositórios atualizados recentemente e limita em 12.
		const url = `${this.baseURL}/users/${usuario}/repos?sort=updated&per_page=12`;
		const resposta = await fetch(url);

		if (!resposta.ok) {
			throw new Error('Erro ao buscar repositórios.');
		}

		return await resposta.json();
	}

	/**
	 * Formata números grandes no padrão brasileiro.
	 */
	formatarNumero(numero) {
		return numero.toLocaleString('pt-BR');
	}

	/**
	 * Escolhe um emoji de acordo com a linguagem do repositório.
	 */
	emojiLinguagem(linguagem) {
		const emojis = {
			'JavaScript': '🟨',
			'TypeScript': '🟦',
			'Python':     '🐍',
			'Java':       '☕',
			'C':          '⚙️',
			'C++':        '⚙️',
			'C#':         '💜',
			'PHP':        '🐘',
			'Ruby':       '💎',
			'Go':         '🐹',
			'Rust':       '🦀',
			'HTML':       '🌐',
			'CSS':        '🎨',
			'Shell':      '🐚',
		};
		return emojis[linguagem] || '📄';
	}
}

// Cria o objeto que vai controlar as buscas no GitHub.
const buscadorGH = new BuscaGitHub();

/**
 * Função principal da busca no GitHub.
 */
async function buscarGitHub() {
	const inputEl  = document.getElementById('input-github');
	const btnEl    = document.getElementById('btn-gh');
	const perfilEl = document.getElementById('perfil-section');

	const usuario = inputEl.value.trim();

	// Não deixa buscar com o campo vazio.
	if (!usuario) {
		mostrarMensagem('msg-github', 'Digite um nome de usuário.', 'erro');
		return;
	}

	// Muda o botão enquanto a busca está acontecendo.
	btnEl.textContent = 'Buscando...';
	btnEl.disabled    = true;
	perfilEl.classList.add('hidden');

	// Remove mensagens antigas antes da nova busca.
	const msgEl = document.getElementById('msg-github');
	msgEl.className = 'mensagem';

	try {
		// Busca perfil e repositórios ao mesmo tempo para ficar mais rápido.
		const [perfil, repos] = await Promise.all([
			buscadorGH.buscarPerfil(usuario),
			buscadorGH.buscarRepositorios(usuario)
		]);

		// Mostra as informações do perfil.
		exibirPerfil(perfil);

		// Mostra os repositórios encontrados.
		exibirRepositorios(repos);

		// Exibe o resultado na tela.
		perfilEl.classList.remove('hidden');
		perfilEl.scrollIntoView({ behavior: 'smooth' });

	} catch (erro) {
		mostrarMensagem('msg-github', erro.message, 'erro');
	}

	// Volta o botão para o estado normal.
	btnEl.textContent = 'Buscar';
	btnEl.disabled    = false;
}

/**
 * Coloca os dados do perfil dentro do HTML.
 */
function exibirPerfil(perfil) {
	document.getElementById('perfil-avatar').src    = perfil.avatar_url;
	document.getElementById('perfil-nome').textContent    = perfil.name || perfil.login;
	document.getElementById('perfil-login').textContent   = '@' + perfil.login;
	document.getElementById('perfil-bio').textContent     = perfil.bio || 'Sem bio cadastrada.';
	document.getElementById('stat-repos').textContent     = buscadorGH.formatarNumero(perfil.public_repos);
	document.getElementById('stat-followers').textContent = buscadorGH.formatarNumero(perfil.followers);
	document.getElementById('stat-following').textContent = buscadorGH.formatarNumero(perfil.following);
	document.getElementById('perfil-link').href           = perfil.html_url;

	// Esses dados podem não existir em alguns perfis.
	const empresa = document.getElementById('detalhe-empresa');
	const local   = document.getElementById('detalhe-local');
	const blog    = document.getElementById('detalhe-blog');

	empresa.textContent = perfil.company  ? '🏢 ' + perfil.company  : '';
	local.textContent   = perfil.location ? '📍 ' + perfil.location : '';

	if (perfil.blog) {
		blog.innerHTML = `🔗 <a href="${perfil.blog}" target="_blank">${perfil.blog}</a>`;
	} else {
		blog.textContent = '';
	}
}

/**
 * Cria os cards dos repositórios usando JavaScript.
 */
function exibirRepositorios(repos) {
	const grid     = document.getElementById('repos-grid');
	const countEl  = document.getElementById('repos-count');

	countEl.textContent = `(${repos.length} exibidos)`;
	grid.innerHTML = '';

	if (repos.length === 0) {
		grid.innerHTML = '<p class="sem-repos">Nenhum repositório público encontrado.</p>';
		return;
	}

	// Para cada repositório recebido, monta um card na tela.
	repos.forEach(repo => {
		const card = document.createElement('div');
		card.className = 'repo-card';

		// Se não tiver linguagem, mostro como "Outros".
		const linguagem = repo.language || 'Outros';
		const emoji     = buscadorGH.emojiLinguagem(repo.language);

		card.innerHTML = `
			<div class="repo-header">
				<a href="${repo.html_url}" target="_blank" class="repo-nome">
					📁 ${repo.name}
				</a>
				${repo.fork ? '<span class="repo-fork-badge">fork</span>' : ''}
			</div>
			<p class="repo-descricao">
				${repo.description || 'Sem descrição.'}
			</p>
			<div class="repo-footer">
				<span class="repo-lang">${emoji} ${linguagem}</span>
				<span class="repo-stat">⭐ ${repo.stargazers_count}</span>
				<span class="repo-stat">🍴 ${repo.forks_count}</span>
				<span class="repo-data">${formatarData(repo.updated_at)}</span>
			</div>
		`;

		grid.appendChild(card);
	});
}

/**
 * Transforma a data do GitHub para o formato brasileiro.
 */
function formatarData(dataISO) {
	const data = new Date(dataISO);
	return data.toLocaleDateString('pt-BR', {
		day:   '2-digit',
		month: 'short',
		year:  'numeric'
	});
}
