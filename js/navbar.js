// navbar.js
// Funções do menu e da proteção das páginas internas.

/**
 * Protege as páginas internas.
 * Se não tiver usuário logado, volta para a tela de login.
 */
function protegerPagina() {
	const usuarioLogado = sessionStorage.getItem('usuarioLogado');

	if (!usuarioLogado) {
		// Sem usuário logado, não deixa acessar a página interna.
		window.location.href = '../index.html';
	}
}

/**
 * Coloca o nome do usuário logado no menu.
 */
function carregarNavbar() {
	const dados = sessionStorage.getItem('usuarioLogado');
	if (!dados) return;

	const usuario = JSON.parse(dados);

	// Só atualiza se o elemento existir na página.
	const nomeEl = document.getElementById('nav-usuario-nome');
	if (nomeEl) {
		nomeEl.textContent = usuario.nome;
	}
}

/**
 * Sai da conta e volta para o login.
 */
function fazerLogout() {
	sessionStorage.removeItem('usuarioLogado');
	window.location.href = '../index.html';
}

/**
 * Marca no menu qual página está aberta.
 */
function marcarLinkAtivo() {
	const paginaAtual = window.location.pathname;
	const links = document.querySelectorAll('.nav-links a');

	links.forEach(link => {
		// Se o link pertence à página atual, recebe a classe active.
		if (paginaAtual.includes(link.getAttribute('href'))) {
			link.classList.add('active');
		}
	});
}

// Roda essas funções quando a página carrega.
protegerPagina();
carregarNavbar();
marcarLinkAtivo();
