// =============================================
// navbar.js — Controla o menu de navegação
// e protege as páginas de quem não está logado
// =============================================

/**
 * Verifica se tem alguém logado.
 * Se não tiver, manda de volta para o login.
 * Essa função é chamada no início de cada página.
 */
function protegerPagina() {
  const usuarioLogado = sessionStorage.getItem('usuarioLogado');

  if (!usuarioLogado) {
    // Ninguém logado — redireciona pro login
    window.location.href = '../index.html';
  }
}

/**
 * Pega o nome do usuário logado e exibe no menu
 */
function carregarNavbar() {
  const dados = sessionStorage.getItem('usuarioLogado');
  if (!dados) return;

  const usuario = JSON.parse(dados);

  // Atualiza o nome exibido no menu (se o elemento existir)
  const nomeEl = document.getElementById('nav-usuario-nome');
  if (nomeEl) {
    nomeEl.textContent = usuario.nome;
  }
}

/**
 * Faz o logout: apaga o usuário da sessão e volta para o login
 */
function fazerLogout() {
  sessionStorage.removeItem('usuarioLogado');
  window.location.href = '../index.html';
}

/**
 * Marca o link ativo no menu conforme a página atual
 */
function marcarLinkAtivo() {
  const paginaAtual = window.location.pathname;
  const links = document.querySelectorAll('.nav-links a');

  links.forEach(link => {
    // Se o href do link está contido no caminho atual, marca como ativo
    if (paginaAtual.includes(link.getAttribute('href'))) {
      link.classList.add('active');
    }
  });
}

// Executa ao carregar qualquer página interna
protegerPagina();
carregarNavbar();
marcarLinkAtivo();
