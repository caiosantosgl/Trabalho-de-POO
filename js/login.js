// =============================================
// login.js — Lógica da tela de login e cadastro
// =============================================

/**
 * Alterna entre as abas de "Entrar" e "Cadastrar"
 * @param {string} aba - 'login' ou 'cadastro'
 */
function mostrarAba(aba) {
  // Pega os elementos do HTML pelo id
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
 * Exibe uma mensagem de erro ou sucesso no formulário
 * @param {string} id       - id do elemento de mensagem
 * @param {string} texto    - texto a exibir
 * @param {string} tipo     - 'erro' ou 'sucesso'
 */
function mostrarMensagem(id, texto, tipo) {
  const el = document.getElementById(id);
  el.textContent = texto;
  el.className = `mensagem ${tipo}`; // aplica a classe de estilo
}

/**
 * Realiza o login quando o botão "Entrar" é clicado
 */
function fazerLogin() {
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-senha').value;

  // Verifica se os campos estão preenchidos
  if (!email || !senha) {
    mostrarMensagem('msg-login', 'Preencha o email e a senha!', 'erro');
    return;
  }

  // Usa a classe GerenciadorDeUsuarios (definida em Usuario.js)
  const usuario = gerenciador.login(email, senha);

  if (usuario) {
    // Login com sucesso! Salva o usuário logado na sessionStorage
    sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    mostrarMensagem('msg-login', `Bem-vindo(a), ${usuario.nome}! Redirecionando...`, 'sucesso');

    // Aguarda 1.2 segundos e vai para a página principal
    setTimeout(() => {
      window.location.href = 'pages/conceitos.html';
    }, 1200);

  } else {
    mostrarMensagem('msg-login', 'Email ou senha incorretos.', 'erro');
  }
}

/**
 * Realiza o cadastro quando o botão "Criar conta" é clicado
 */
function fazerCadastro() {
  const nome      = document.getElementById('cad-nome').value.trim();
  const email     = document.getElementById('cad-email').value.trim();
  const senha     = document.getElementById('cad-senha').value;
  const confirmar = document.getElementById('cad-confirmar').value;

  // Chama o método cadastrar da classe GerenciadorDeUsuarios
  const resultado = gerenciador.cadastrar(nome, email, senha, confirmar);

  if (resultado.sucesso) {
    mostrarMensagem('msg-cadastro', resultado.mensagem, 'sucesso');

    // Limpa os campos do formulário
    document.getElementById('cad-nome').value     = '';
    document.getElementById('cad-email').value    = '';
    document.getElementById('cad-senha').value    = '';
    document.getElementById('cad-confirmar').value = '';

    // Depois de 2 segundos, muda pra aba de login
    setTimeout(() => mostrarAba('login'), 2000);

  } else {
    mostrarMensagem('msg-cadastro', resultado.mensagem, 'erro');
  }
}

// Permite pressionar Enter para fazer login
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
