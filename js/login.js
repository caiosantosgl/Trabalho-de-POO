// login.js
// Funções da tela de login e cadastro.

/**
 * Mostra a aba de login ou a aba de cadastro.
 */
function mostrarAba(aba) {
	// Pego os formulários e botões para trocar as abas.
	const formLogin    = document.getElementById('form-login');
	const formCadastro = document.getElementById('form-cadastro');
	const btnLogin     = document.getElementById('btn-login');
	const btnCadastro  = document.getElementById('btn-cadastro');

	if (aba === 'login') {
		formLogin.classList.remove('hidden');
		formCadastro.classList.add('hidden');
		btnLogin.classList.add('active');
		btnCadastro.classList.remove('active');
	} else {
		formLogin.classList.add('hidden');
		formCadastro.classList.remove('hidden');
		btnLogin.classList.remove('active');
		btnCadastro.classList.add('active');
	}
}

/**
 * Mostra mensagens de erro ou sucesso na tela.
 */
function mostrarMensagem(id, texto, tipo) {
	const el = document.getElementById(id);
	el.textContent = texto;
	el.className = `mensagem ${tipo}`; // adiciona a classe de erro ou sucesso
}

/**
 * Faz o login quando o usuário clica em Entrar.
 */
function fazerLogin() {
	const email = document.getElementById('login-email').value.trim();
	const senha = document.getElementById('login-senha').value;

	// Antes de tentar entrar, confere se os campos não estão vazios.
	if (!email || !senha) {
		mostrarMensagem('msg-login', 'Preencha o email e a senha!', 'erro');
		return;
	}

	// Usa o gerenciador criado no arquivo Usuario.js.
	const usuario = gerenciador.login(email, senha);

	if (usuario) {
		// Se deu certo, salva o usuário logado na sessão.
		sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));
		mostrarMensagem('msg-login', `Bem-vindo(a), ${usuario.nome}! Redirecionando...`, 'sucesso');

		// Espera um pouco para o usuário conseguir ler a mensagem.
		setTimeout(() => {
			window.location.href = 'pages/conceitos.html';
		}, 1200);

	} else {
		mostrarMensagem('msg-login', 'Email ou senha incorretos.', 'erro');
	}
}

/**
 * Faz o cadastro quando o usuário clica em Criar conta.
 */
function fazerCadastro() {
	const nome      = document.getElementById('cad-nome').value.trim();
	const email     = document.getElementById('cad-email').value.trim();
	const senha     = document.getElementById('cad-senha').value;
	const confirmar = document.getElementById('cad-confirmar').value;

	// Envia os dados para o método cadastrar do gerenciador.
	const resultado = gerenciador.cadastrar(nome, email, senha, confirmar);

	if (resultado.sucesso) {
		mostrarMensagem('msg-cadastro', resultado.mensagem, 'sucesso');

		// Limpa o formulário depois do cadastro dar certo.
		document.getElementById('cad-nome').value     = '';
		document.getElementById('cad-email').value    = '';
		document.getElementById('cad-senha').value    = '';
		document.getElementById('cad-confirmar').value = '';

		// Depois de cadastrar, volta para a aba de login.
		setTimeout(() => mostrarAba('login'), 2000);

	} else {
		mostrarMensagem('msg-cadastro', resultado.mensagem, 'erro');
	}
}

// Também deixa usar Enter para enviar o formulário.
document.addEventListener('keydown', function(e) {
	if (e.key === 'Enter') {
		const abaAtiva = document.getElementById('form-login').classList.contains('hidden');
		if (!abaAtiva) {
			fazerLogin();
		} else {
			fazerCadastro();
		}
	}
});
