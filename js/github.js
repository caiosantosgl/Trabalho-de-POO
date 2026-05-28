// github.js — Lógica de busca no GitHub usando POO
// Consome a API pública: https://api.github.com

/**
 * CLASSE BuscaGitHub
 * 
 * Encapsula toda a lógica de buscar dados
 * de um usuário do GitHub e seus repositórios.
 */
class BuscaGitHub {

  constructor() {
    // URL base da API do GitHub
    this.baseURL = 'https://api.github.com';
  }

  /**
   * Busca os dados do perfil de um usuário
   * @param {string} usuario - o username do GitHub
   * @returns {object} dados do perfil
   */
  async buscarPerfil(usuario) {
    const url = `${this.baseURL}/users/${usuario}`;
    const resposta = await fetch(url);

    // Status 404 = usuário não existe
    if (resposta.status === 404) {
      throw new Error(`Usuário "${usuario}" não encontrado no GitHub.`);
    }

    // Status 403 = limite de requisições atingido
    if (resposta.status === 403) {
      throw new Error('Limite de buscas da API atingido. Aguarde um minuto.');
    }

    if (!resposta.ok) {
      throw new Error('Erro ao acessar a API do GitHub.');
    }

    return await resposta.json();
  }

  /**
   * Busca os repositórios de um usuário
   * Ordena pelos mais recentemente atualizados
   * @param {string} usuario - o username do GitHub
   * @returns {array} lista de repositórios
   */
  async buscarRepositorios(usuario) {
    // sort=updated ordena pelo mais recentemente atualizado
    // per_page=12 limita a 12 repositórios
    const url = `${this.baseURL}/users/${usuario}/repos?sort=updated&per_page=12`;
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error('Erro ao buscar repositórios.');
    }

    return await resposta.json();
  }

  /**
   * Formata um número grande com ponto (ex: 1000 -> 1.000)
   */
  formatarNumero(numero) {
    return numero.toLocaleString('pt-BR');
  }

  /**
   * Retorna um emoji baseado na linguagem de programação
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

// =============================================
// Cria uma instância da classe BuscaGitHub
// =============================================
const buscadorGH = new BuscaGitHub();

/**
 * Função principal: chamada ao clicar em "Buscar"
 */
async function buscarGitHub() {
  const inputEl  = document.getElementById('input-github');
  const btnEl    = document.getElementById('btn-gh');
  const perfilEl = document.getElementById('perfil-section');

  const usuario = inputEl.value.trim();

  // Verifica se digitou alguma coisa
  if (!usuario) {
    mostrarMensagem('msg-github', 'Digite um nome de usuário.', 'erro');
    return;
  }

  // Muda o estado do botão enquanto busca
  btnEl.textContent = 'Buscando...';
  btnEl.disabled    = true;
  perfilEl.classList.add('hidden');

  // Limpa mensagens anteriores
  const msgEl = document.getElementById('msg-github');
  msgEl.className = 'mensagem';

  try {
    // Chama os dois métodos da classe simultaneamente
    // Promise.all() espera os dois terminarem antes de continuar
    const [perfil, repos] = await Promise.all([
      buscadorGH.buscarPerfil(usuario),
      buscadorGH.buscarRepositorios(usuario)
    ]);

    // Preenche os dados do perfil na tela
    exibirPerfil(perfil);

    // Preenche a lista de repositórios
    exibirRepositorios(repos);

    // Mostra a seção do perfil
    perfilEl.classList.remove('hidden');
    perfilEl.scrollIntoView({ behavior: 'smooth' });

  } catch (erro) {
    mostrarMensagem('msg-github', erro.message, 'erro');
  }

  // Restaura o botão
  btnEl.textContent = 'Buscar';
  btnEl.disabled    = false;
}

/**
 * Preenche o card de perfil com os dados recebidos da API
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

  // Detalhes opcionais (empresa, localização, blog)
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
 * Cria os cards de repositórios dinamicamente
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

  // Para cada repositório, cria um card
  repos.forEach(repo => {
    const card = document.createElement('div');
    card.className = 'repo-card';

    // Define a cor de destaque baseada na linguagem
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
 * Formata a data do GitHub (ISO 8601) para português
 * Ex: "2024-03-15T10:00:00Z" → "15 de mar. de 2024"
 */
function formatarData(dataISO) {
  const data = new Date(dataISO);
  return data.toLocaleDateString('pt-BR', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric'
  });
}
